import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { orderNotification } from "@/email/orderNotification";
import { sendMail } from "@/lib/sendMail";
import { NextResponse } from "next/server";
import crypto from "crypto";

// --- (verifyHash function remains the same) ---
const verifyHash = (data, salt) => {
    const hashString = `${salt}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${data.key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    return calculatedHash === data.hash;
};


// --- FIX: NEW HELPER FUNCTION TO UNLOCK STOCK ---
async function unlockStock(order, session = null) {
    console.log(`Unlocking stock for failed order ${order.order_id}`);
    for (const item of order.products) {
        try {
            if (!item.variantId || item.variantId.toString().includes('fallback-')) {
                // Handle fallback variants
                const productId = item.productId;
                await ProductModel.findOneAndUpdate(
                    { _id: productId },
                    { $inc: { quantity: item.qty }, isAvailable: true }, // Increment quantity back
                    { session }
                );
            } else {
                // Handle real variants
                await ProductVariantModel.findOneAndUpdate(
                    { _id: item.variantId },
                    { $inc: { quantity: item.qty } }, // Increment quantity back
                    { session }
                );
            }
        } catch (error) {
            // Log error but don't stop the redirect.
            // This needs monitoring.
            console.error(`CRITICAL: Failed to unlock stock for item ${item.variantId || item.productId} in order ${order.order_id}`, error);
        }
    }
}


export async function POST(request) {
    let session;
    let order; // --- Define order in outer scope ---

    try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        
        await connectDB();

        const salt = process.env.PAYU_SALT;
        const key = process.env.PAYU_KEY;

        // 1. Verify the hash
        const isHashValid = verifyHash({ ...data, key }, salt);
        if (!isHashValid) {
            return NextResponse.redirect(new URL('/payment-failed?error=invalid_hash', process.env.NEXT_PUBLIC_BASE_URL));
        }

        // 2. Find the order
        order = await OrderModel.findOne({ transaction_id: data.txnid });
        if (!order) {
            return NextResponse.redirect(new URL('/payment-failed?error=order_not_found', process.env.NEXT_PUBLIC_BASE_URL));
        }
        
        // If order is already processed, just redirect
        if (order.status !== 'pending-payment') {
             const redirectURL = data.status === 'success' 
                ? `/order-details/${order.order_id}` 
                : '/payment-failed?error=payment_failed_or_cancelled';
             return NextResponse.redirect(new URL(redirectURL, process.env.NEXT_PUBLIC_BASE_URL));
        }

        // 3. Handle payment status
        if (data.status === 'success') {
            // Start a database transaction
            session = await OrderModel.startSession();
            session.startTransaction();

            try {
                // 4. PAYMENT SUCCESS: Update order status
                order.status = 'processing'; // Or 'pending'
                order.payment_gateway_id = data.mihpayid;
                await order.save({ session });

                // --- 5. (CRITICAL FIX) STOCK DEDUCTION IS REMOVED ---
                // The stock was already deducted by /api/stock/atomic-purchase
                // We no longer need to do it here. This fixes the race condition.

                // Commit transaction
                await session.commitTransaction();
                
                // 6. Send email notification
                try {
                    const mailData = {
                        order_id: order.order_id,
                        orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${order.order_id}`
                    }
                    await sendMail('Order placed successfully.', order.email, orderNotification(mailData));
                } catch (emailError) {
                    console.error("Failed to send order email:", emailError);
                }

                // 7. Redirect user to success page
                return NextResponse.redirect(new URL(`/order-details/${order.order_id}?status=success`, process.env.NEXT_PUBLIC_BASE_URL));

            } catch (error) {
                // If DB save fails, roll back
                await session.abortTransaction();
                
                // --- FIX: ROLLBACK STOCK ---
                // If the final order save fails, we must also unlock the stock.
                await unlockStock(order); // Pass the full order object

                order.status = 'failed'; 
                order.ordernote = `Payment successful but order failed: ${error.message}`;
                await order.save(); // Save failure status outside transaction
                return NextResponse.redirect(new URL(`/payment-failed?error=order_processing_failed&txnid=${data.txnid}`, process.env.NEXT_PUBLIC_BASE_URL));
            } finally {
                session.endSession();
            }

        } else {
            // 4. PAYMENT FAILURE
            
            // --- 5. (CRITICAL FIX) UNLOCK STOCK ---
            // Payment failed or was cancelled, so we must
            // return the items to the inventory.
            await unlockStock(order); // Pass the full order object
            
            // 6. Update order status to 'failed'
            order.status = 'failed';
            order.ordernote = `Payment failed or cancelled. Reason: ${data.error_Message || 'Unknown'}`;
            await order.save();
            
            // 7. Redirect user to failure page
            return NextResponse.redirect(new URL(`/payment-failed?error=${data.error_Message || 'payment_failed'}&txnid=${data.txnid}`, process.env.NEXT_PUBLIC_BASE_URL));
        }

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        
        // --- FIX: Safety net to unlock stock on catastrophic error ---
        if (order) {
            await unlockStock(order);
        }

        console.error("Critical error in PayU verify route:", error);
        return NextResponse.redirect(new URL('/payment-failed?error=server_error', process.env.NEXT_PUBLIC_BASE_URL));
    }
}