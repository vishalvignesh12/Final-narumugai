import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";

const cancelOrderSchema = z.object({
    orderId: z.string().length(24, 'Invalid order ID format'),
    reason: z.string().min(1, 'Cancellation reason is required').max(500, 'Reason too long')
});

export async function PUT(request) {
    try {
        await connectDB()
        
        // Authenticate user
        const auth = await isAuthenticated('user')
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const payload = await request.json()
        const validate = cancelOrderSchema.safeParse(payload)
        
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { orderId, reason } = validate.data
        
        // Start database session for transaction
        const session = await OrderModel.startSession()
        
        try {
            session.startTransaction()

            // Find the order and verify ownership
            const order = await OrderModel.findOne({
                _id: orderId,
                user: auth.userId,
                deletedAt: null
            }).session(session)

            if (!order) {
                throw new Error('Order not found or access denied')
            }

            // Check if order can be cancelled (only pending, processing orders can be cancelled)
            if (!['pending', 'processing'].includes(order.status)) {
                throw new Error(`Cannot cancel order with status: ${order.status}. Only pending or processing orders can be cancelled.`)
            }

            // Restore stock for cancelled order
            for (const product of order.products) {
                // Add back the quantity to the product variant
                const result = await ProductVariantModel.findByIdAndUpdate(
                    product.variantId,
                    {
                        $inc: { quantity: product.qty }
                    },
                    {
                        session,
                        new: true
                    }
                ).populate('product')

                if (result) {
                    // If product was marked as sold out, make it available again
                    if (!result.product.isAvailable && result.quantity > 0) {
                        await ProductModel.findByIdAndUpdate(
                            result.product._id,
                            {
                                isAvailable: true,
                                $unset: { soldAt: 1 } // Remove soldAt timestamp
                            },
                            { session }
                        )
                    }
                }
            }

            // Update order status to cancelled and add cancellation reason
            await OrderModel.findByIdAndUpdate(
                orderId,
                {
                    status: 'cancelled',
                    cancellationReason: reason,
                    cancelledAt: new Date(),
                    cancelledBy: auth.userId
                },
                { session }
            )

            await session.commitTransaction()

            return response(true, 200, 'Order cancelled successfully. Stock has been restored.')

        } catch (error) {
            await session.abortTransaction()
            throw error
        } finally {
            session.endSession()
        }

    } catch (error) {
        return catchError(error)
    }
}