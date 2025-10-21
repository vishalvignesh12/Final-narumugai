import { orderNotification } from "@/email/orderNotification";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { sendMail } from "@/lib/sendMail";
import { zSchema } from "@/lib/zodSchema";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { validatePaymentVerification } from "razorpay/dist/utils/razorpay-utils";
import { z } from "zod";
import logger, { logPayment } from "@/lib/logger.js";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const productSchema = z.object({
            productId: z.string().length(24, 'Invalid product id format'),
            variantId: z.string().length(24, 'Invalid variant id format'),
            name: z.string().min(1),
            qty: z.number().min(1),
            mrp: z.number().nonnegative(),
            sellingPrice: z.number().nonnegative()
        })

        const orderSchema = zSchema.pick({
            name: true, email: true, phone: true, country: true, state: true, city: true, pincode: true, landmark: true, ordernote: true
        }).extend({
            userId: z.string().optional(),
            razorpay_payment_id: z.string().min(3, 'Payment id is required.'),
            razorpay_order_id: z.string().min(3, 'Order id is required.'),
            razorpay_signature: z.string().min(3, 'Signature is required.'),
            subtotal: z.number().nonnegative(),
            discount: z.number().nonnegative(),
            couponDiscountAmount: z.number().nonnegative(),
            totalAmount: z.number().nonnegative(),
            products: z.array(productSchema),
            stockLockItems: z.array(z.object({
                variantId: z.string(), // Accept any string - validation will happen in the logic
                quantity: z.number().min(1)
            })).optional()
        })


        const validate = orderSchema.safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', { error: validate.error })
        }

        const validatedData = validate.data

        // payment verification 
        const verification = validatePaymentVerification({
            order_id: validatedData.razorpay_order_id,
            payment_id: validatedData.razorpay_payment_id
        }, validatedData.razorpay_signature, process.env.RAZORPAY_KEY_SECRET)

        let paymentVerification = false
        if (verification) {
            paymentVerification = true
        }

        // Start database session for transaction
        const session = await OrderModel.startSession()
        
        try {
            session.startTransaction()

            // If payment is verified and we have stock lock items, deduct the actual stock
            // Only perform deduction if it hasn't been handled by atomic purchase elsewhere
            if (paymentVerification && validatedData.stockLockItems && validatedData.stockLockItems.length > 0) {
                for (const lockItem of validatedData.stockLockItems) {
                    // Handle fallback variants (products without real variants)
                    if (!lockItem.variantId || lockItem.variantId === 'null' || lockItem.variantId.includes('fallback-')) {
                        // Extract product ID from fallback variant ID
                        const productId = lockItem.variantId?.startsWith('fallback-') 
                            ? lockItem.variantId.replace('fallback-', '') 
                            : lockItem.variantId
                        
                        // For products without variants, deduct at product level
                        // First check if the product exists and has sufficient quantity
                        const product = await ProductModel.findById(productId).session(session);
                        
                        if (!product) {
                            throw new Error('Product not found for stock deduction');
                        }
                        
                        // Check if we have sufficient stock (quantity should be >= requested amount)
                        if (product.quantity < lockItem.quantity) {
                            throw new Error('Insufficient stock for this product');
                        }
                        
                        const result = await ProductModel.findOneAndUpdate(
                            {
                                _id: productId,
                                quantity: { $gte: lockItem.quantity }
                            },
                            {
                                $inc: {
                                    quantity: -lockItem.quantity
                                }
                            },
                            {
                                session,
                                new: true
                            }
                        )

                        if (!result) {
                            throw new Error('Stock deduction failed - product may have been sold to another customer')
                        }

                        // Mark product as sold out if quantity becomes 0
                        if (result.quantity === 0) {
                            await ProductModel.findByIdAndUpdate(
                                result._id,
                                {
                                    isAvailable: false,
                                    soldAt: new Date()
                                },
                                { session }
                            )
                        }
                        
                        continue
                    }
                    
                    // Handle real variants
                    // Validate that it's a proper ID format for real variants (24 hex characters)
                    if (lockItem.variantId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(lockItem.variantId)) {
                        throw new Error(`Invalid variant ID format: ${lockItem.variantId}`);
                    }
                    
                    // First check if the variant exists and has sufficient quantity
                    const variant = await ProductVariantModel.findById(lockItem.variantId).session(session);
                    
                    if (!variant) {
                        throw new Error('Product variant not found for stock deduction');
                    }
                    
                    // Check if we have sufficient stock (quantity should be >= requested amount)
                    if (variant.quantity < lockItem.quantity) {
                        throw new Error('Insufficient stock for this variant');
                    }
                    
                    // Deduct from actual quantity
                    const result = await ProductVariantModel.findOneAndUpdate(
                        {
                            _id: lockItem.variantId,
                            quantity: { $gte: lockItem.quantity }
                        },
                        {
                            $inc: {
                                quantity: -lockItem.quantity
                            }
                        },
                        {
                            session,
                            new: true
                        }
                    ).populate('product')

                    if (!result) {
                        throw new Error('Stock deduction failed - product may have been sold to another customer')
                    }

                    // Mark product as sold out if quantity becomes 0
                    if (result.quantity === 0) {
                        await ProductModel.findByIdAndUpdate(
                            result.product._id,
                            {
                                isAvailable: false,
                                soldAt: new Date()
                            },
                            { session }
                        )
                    }
                }
            }

            const newOrder = await OrderModel.create([{
                user: validatedData.userId,
                name: validatedData.name,
                email: validatedData.email,
                phone: validatedData.phone,
                country: validatedData.country,
                state: validatedData.state,
                city: validatedData.city,
                pincode: validatedData.pincode,
                landmark: validatedData.landmark,
                ordernote: validatedData.ordernote,
                products: validatedData.products,
                discount: validatedData.discount,
                couponDiscountAmount: validatedData.couponDiscountAmount,
                totalAmount: validatedData.totalAmount,
                subtotal: validatedData.subtotal,
                payment_id: validatedData.razorpay_payment_id,
                order_id: validatedData.razorpay_order_id,
                status: paymentVerification ? 'pending' : 'unverified'
            }], { session })

            await session.commitTransaction()

            try {
                const mailData = {
                    order_id: validatedData.razorpay_order_id,
                    orderDetailsUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/order-details/${validatedData.razorpay_order_id}`
                }

                await sendMail('Order placed successfully.', validatedData.email, orderNotification(mailData))
                logger.info({ orderId: validatedData.razorpay_order_id, email: validatedData.email }, 'Order confirmation email sent');

            } catch (error) {
                logger.warn({ 
                    orderId: validatedData.razorpay_order_id, 
                    email: validatedData.email,
                    error: error.message 
                }, 'Failed to send order confirmation email');
            }

            return response(true, 200, 'Order placed successfully.')

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