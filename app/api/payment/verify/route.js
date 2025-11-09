import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { orderNotification } from "@/email/orderNotification";
import { sendMail } from "@/lib/sendMail";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Function to verify PayU hash
const verifyHash = (data, salt) => {
    // The hash string sequence for response is different!
    // salt|status|||||||||||email|firstname|productinfo|amount|txnid|key
    const hashString = `${salt}|${data.status}|||||||||||${data.email}|${data.firstname}|${data.productinfo}|${data.amount}|${data.txnid}|${data.key}`;
    const calculatedHash = crypto.createHash('sha512').update(hashString).digest('hex');
    return calculatedHash === data.hash;
};

// This route handles BOTH success and failure callbacks from PayU
export async function POST(request) {
    let session;
    try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        
        await connectDB();

        const salt = process.env.PAYU_SALT;
        const key = process.env.PAYU_KEY;

        // 1. Verify the hash to ensure the request is from PayU
        const isHashValid = verifyHash({ ...data, key }, salt);

        if (!isHashValid) {
            // Hash mismatch, potential tampering
            return NextResponse.redirect(new URL('/payment-failed?error=invalid_hash', process.env.NEXT_PUBLIC_BASE_URL));
        }

        // 2. Find the order in our database
        const order = await OrderModel.findOne({ transaction_id: data.txnid });

        if (!order) {
            // Order not found
            return NextResponse.redirect(new URL('/payment-failed?error=order_not_found', process.env.NEXT_PUBLIC_BASE_URL));
        }
        
        // If order is already processed, just redirect
        if (order.status !== 'pending-payment') {
             return NextResponse.redirect(new URL(`/order-details/${order.order_id}`, process.env.NEXT_PUBLIC_BASE_URL));
        }

        // 3. Handle payment status
        if (data.status === 'success') {
            // Start a database transaction
            session = await OrderModel.startSession();
            session.startTransaction();

            try {
                // 4. PAYMENT SUCCESS: Update order status
                order.status = 'pending'; // Or "processing"
                order.payment_gateway_id = data.mihpayid;
                await order.save({ session });

                // 5. Deduct stock (using your logic from the original save-order route)
                // ** NOTE: This logic assumes 'stockLockItems' is not used, and deducts from 'products' array **
                for (const item of order.products) {
                    
                    // Handle fallback variants (products without real variants)
                    if (!item.variantId || item.variantId.toString().includes('fallback-')) {
                        const productId = item.productId;
                        const result = await ProductModel.findOneAndUpdate(
                            { _id: productId, quantity: { $gte: item.qty } },
                            { $inc: { quantity: -item.qty } },
                            { session, new: true }
                        );
                        if (!result) throw new Error(`Stock deduction failed for product ${productId}`);
                        if (result.quantity === 0) {
                            await ProductModel.findByIdAndUpdate(result._id, { isAvailable: false, soldAt: new Date() }, { session });
                        }
                    } else {
                        // Handle real variants
                        const result = await ProductVariantModel.findOneAndUpdate(
                            { _id: item.variantId, quantity: { $gte: item.qty } },
                            { $inc: { quantity: -item.qty } },
                            { session, new: true }
                        );
                        if (!result) throw new Error(`Stock deduction failed for variant ${item.variantId}`);
                        
                        // This part was missing in your original code, might be needed
                        // if (result.quantity === 0) {
                        //    await ProductVariantModel.findByIdAndUpdate(result._id, { isAvailable: false }, { session });
                        // }
                    }
                }
                
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
                // If stock deduction or order update fails, roll back
                await session.abortTransaction();
                order.status = 'failed'; // Mark as failed if transaction failed
                order.ordernote = `Payment successful but order failed: ${error.message}`;
                await order.save();
                return NextResponse.redirect(new URL(`/payment-failed?error=order_processing_failed&txnid=${data.txnid}`, process.env.NEXT_PUBLIC_BASE_URL));
            } finally {
                session.endSession();
            }

        } else {
            // 4. PAYMENT FAILURE: Update order status
            order.status = 'failed';
            order.ordernote = `Payment failed or cancelled. Reason: ${data.error_Message || 'Unknown'}`;
            await order.save();
            
            // 5. Redirect user to failure page
            return NextResponse.redirect(new URL(`/payment-failed?error=${data.error_Message || 'payment_failed'}&txnid=${data.txnid}`, process.env.NEXT_PUBLIC_BASE_URL));
        }

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        console.error("Critical error in PayU verify route:", error);
        return NextResponse.redirect(new URL('/payment-failed?error=server_error', process.env.NEXT_PUBLIC_BASE_URL));
    }
}