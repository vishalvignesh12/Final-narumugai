import { connectDB } from "@/lib/databaseConnection";
import OrderModel from "@/models/Order.model";
import { NextResponse } from "next/server";
import { createOrderAccessToken } from "@/lib/orderAccess";
import { unlockStock } from "@/lib/inventoryRestore";
import { sanitizeGatewayText } from "@/lib/sanitize";
import { verifyLegacyPayUHash } from "@/lib/payments/legacyPayu";
import { getOrderUrl, sendOrderNotifications } from "@/lib/orderNotifications";
import { getBaseURL } from "@/lib/config";


export async function POST(request) {
    let session;
    let order; // --- Define order in outer scope ---

    try {
        const formData = await request.formData();
        const data = Object.fromEntries(formData);
        const baseURL = getBaseURL();
        
        await connectDB();

        const salt = process.env.PAYU_SALT;
        const key = process.env.PAYU_KEY;
        if (!salt || !key) throw new Error('PayU is not configured.');

        // 1. Verify the hash
        const isHashValid = data.key === key && verifyLegacyPayUHash(data, salt);
        if (!isHashValid) {
            return NextResponse.redirect(new URL('/payment-failure?error=invalid_hash', baseURL));
        }

        // 2. Find the order
        order = await OrderModel.findOne({ transaction_id: data.txnid });
        if (!order) {
            return NextResponse.redirect(new URL('/payment-failure?error=order_not_found', baseURL));
        }
        if (data.key !== key || Number(data.amount).toFixed(2) !== Number(order.totalAmount).toFixed(2)) {
            return NextResponse.redirect(new URL('/payment-failure?error=payment_mismatch', baseURL));
        }
        
        // If order is already processed, just redirect
        if (order.status !== 'pending-payment') {
             const accessToken = data.status === 'success' ? await createOrderAccessToken(order.order_id) : null;
             const redirectURL = data.status === 'success'
                ? `/order-details/${order.order_id}?status=success&access_token=${encodeURIComponent(accessToken)}`
                : '/payment-failure?error=payment_failed_or_cancelled';
             return NextResponse.redirect(new URL(redirectURL, baseURL));
        }

        // 3. Handle payment status
        if (data.status === 'success') {
            // Start a database transaction
            session = await OrderModel.startSession();
            session.startTransaction();
            let paymentCommitted = false;

            try {
                const claimedOrder = await OrderModel.findOneAndUpdate(
                    { _id: order._id, status: 'pending-payment' },
                    {
                        $set: {
                            status: 'processing',
                            payment_status: 'paid',
                            payment_method: 'PayU',
                            payment_id: data.mihpayid
                        }
                    },
                    { new: true, session }
                );
                if (!claimedOrder) {
                    await session.abortTransaction();
                    session = null;
                    const accessToken = await createOrderAccessToken(order.order_id);
                    return NextResponse.redirect(new URL(`/order-details/${order.order_id}?status=success&access_token=${encodeURIComponent(accessToken)}`, baseURL));
                }
                order = claimedOrder;

                // --- 5. (CRITICAL FIX) STOCK DEDUCTION IS REMOVED ---
                // The stock was already deducted by /api/stock/atomic-purchase
                // We no longer need to do it here. This fixes the race condition.

                // Commit transaction
                await session.commitTransaction();
                paymentCommitted = true;
                
                // Notifications are sent only after the payment/order transaction commits.
                let accessToken = null;
                try {
                    accessToken = await createOrderAccessToken(order.order_id);
                } catch (tokenError) {
                    console.error(`Could not create order access link for ${order.order_id}:`, tokenError.message);
                }

                const fallbackSuccessUrl = new URL('/payment-success', baseURL);
                fallbackSuccessUrl.searchParams.set('orderId', order.order_id);
                fallbackSuccessUrl.searchParams.set('transactionId', order.transaction_id);
                fallbackSuccessUrl.searchParams.set('amount', String(order.totalAmount));
                const customerOrderUrl = accessToken
                    ? getOrderUrl(baseURL, order.order_id, accessToken)
                    : fallbackSuccessUrl.toString();

                try {
                    await sendOrderNotifications({
                        order,
                        baseURL,
                        customerOrderUrl
                    });
                } catch (emailError) {
                    console.error(`Failed to prepare order notifications for ${order.order_id}:`, emailError.message);
                }

                // 7. Redirect user to success page
                if (!accessToken) return NextResponse.redirect(fallbackSuccessUrl);
                const successUrl = new URL(`/order-details/${encodeURIComponent(order.order_id)}`, baseURL);
                successUrl.searchParams.set('status', 'success');
                successUrl.searchParams.set('access_token', accessToken);
                return NextResponse.redirect(successUrl);

            } catch (error) {
                if (paymentCommitted) {
                    console.error(`Order ${order.order_id} was paid, but its confirmation step failed:`, error.message);
                    const successUrl = new URL('/payment-success', baseURL);
                    successUrl.searchParams.set('orderId', order.order_id);
                    successUrl.searchParams.set('transactionId', order.transaction_id);
                    successUrl.searchParams.set('amount', String(order.totalAmount));
                    return NextResponse.redirect(successUrl);
                }
                // If DB save fails, roll back
                await session.abortTransaction();
                
                // Stock remains reserved: the gateway confirmed payment, so
                // releasing it here could sell the same item twice.
                console.error('Payment succeeded but order processing failed:', error);
                return NextResponse.redirect(new URL(`/payment-failure?error=order_processing_failed&txnid=${data.txnid}`, baseURL));
            } finally {
                session.endSession();
            }

        } else {
            // 4. PAYMENT FAILURE
            
            session = await OrderModel.startSession();
            session.startTransaction();
            const failedOrder = await OrderModel.findOneAndUpdate(
                { _id: order._id, status: 'pending-payment' },
                { $set: { status: 'failed', payment_status: 'failed', payment_method: 'PayU', ordernote: `Payment failed or cancelled. Reason: ${sanitizeGatewayText(data.error_Message)}` } },
                { new: true, session }
            );
            if (failedOrder) await unlockStock(failedOrder, session);
            await session.commitTransaction();
            session.endSession();
            session = null;
            
            // 7. Redirect user to failure page
            return NextResponse.redirect(new URL(`/payment-failure?error=${encodeURIComponent(sanitizeGatewayText(data.error_Message, 120))}&txnid=${encodeURIComponent(data.txnid)}`, baseURL));
        }

    } catch (error) {
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        
        console.error("Critical error in PayU verify route:", error);
        return NextResponse.redirect(new URL('/payment-failure?error=server_error', getBaseURL()));
    }
}
