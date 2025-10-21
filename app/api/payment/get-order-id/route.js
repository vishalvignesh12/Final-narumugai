import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import Razorpay from "razorpay";
import { applyRateLimit, paymentRateLimiter } from "@/lib/rateLimiter";
import { validateCheckoutSession } from "@/lib/sessionManager";
import { validateCsrfMiddleware } from "@/lib/csrfProtection";
import { config } from "@/lib/envConfig";
import logger from "@/lib/logger";
import { z } from "zod";

export async function POST(request) {
    try {
        // Apply rate limiting
        const rateLimitResult = await applyRateLimit(request, paymentRateLimiter);
        if (rateLimitResult) return rateLimitResult;

        // Validate CSRF token
        const csrfValidation = await validateCsrfMiddleware(request);
        if (!csrfValidation.valid) return csrfValidation.response;

        await connectDB()
        const payload = await request.json()

        // Enhanced schema with session token and metadata
        const schema = z.object({
            amount: zSchema.shape.amount,
            sessionToken: z.string().min(1, 'Session token required'),
            cartItems: z.array(z.object({
                productId: z.string(),
                variantId: z.string(),
                quantity: z.number(),
                name: z.string().optional(),
                price: z.number().optional(),
            })),
            lockId: z.string().optional(),
            shippingAddress: z.object({
                name: z.string(),
                email: z.string().email(),
                phone: z.string(),
                city: z.string(),
                state: z.string(),
                country: z.string(),
                pincode: z.string(),
            }).optional(),
        });

        const validate = schema.safeParse(payload)

        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { amount, sessionToken, cartItems, lockId, shippingAddress } = validate.data

        // Validate checkout session
        const session = await validateCheckoutSession(sessionToken, cartItems);
        if (!session) {
            logger.warn({ cartItemCount: cartItems.length }, 'Payment order creation failed: Invalid session');
            return response(false, 401, 'Invalid or expired checkout session');
        }

        const razInstance = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        })

        const razOption = {
            amount: Number(amount) * 100,
            currency: config.DEFAULT_CURRENCY,
            notes: {
                // Store metadata for webhook processing
                sessionId: session.sessionId,
                userId: session.userId || 'guest',
                lockId: lockId || '',
                cartItems: JSON.stringify(cartItems),
                shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : '',
            }
        }

        const orderDetail = await razInstance.orders.create(razOption)
        const order_id = orderDetail.id

        logger.info({
            orderId: order_id,
            amount,
            currency: config.DEFAULT_CURRENCY,
            sessionId: session.sessionId,
            userId: session.userId,
            lockId,
        }, 'Razorpay order created successfully');

        return response(true, 200, 'Order id generated.', order_id)

    } catch (error) {
        return catchError(error)
    }
}