import { connectDB } from '@/lib/databaseConnection';
import { catchError } from '@/lib/helperFunction';
import OrderModel from '@/models/Order.model';
import ProductModel from '@/models/Product.model';
import ProductVariantModel from '@/models/ProductVariant.model';
import { validateWebhookSignature } from 'razorpay/dist/utils/razorpay-utils';
import { config } from '@/lib/envConfig';
import logger from '@/lib/logger';
import { sendMail } from '@/lib/sendMail';
import { orderNotification } from '@/email/orderNotification';
import Razorpay from 'razorpay';
import { applyRateLimit, webhookRateLimiter } from '@/lib/rateLimiter';

/**
 * POST /api/webhooks/razorpay
 *
 * Razorpay Payment Webhook Handler
 *
 * Ensures orders are created even if frontend success handler fails
 * Handles payment.captured, payment.failed, and payment.authorized events
 */

export async function POST(request) {
  try {
    // Apply rate limiting (with higher limits for webhooks)
    const rateLimitResult = await applyRateLimit(request, webhookRateLimiter);
    if (rateLimitResult) return rateLimitResult;

    await connectDB();

    // Get webhook body and signature
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      logger.warn('Webhook received without signature');
      return new Response(
        JSON.stringify({ error: 'Missing signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Verify webhook signature
    const isValid = validateWebhookSignature(
      body,
      signature,
      config.RAZORPAY_WEBHOOK_SECRET
    );

    if (!isValid) {
      logger.warn({ signature }, 'Invalid webhook signature - possible attack');
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse webhook payload
    const event = JSON.parse(body);
    const eventType = event.event;

    logger.info({ eventType, paymentId: event.payload?.payment?.entity?.id }, 'Webhook received');

    // Handle different event types
    switch (eventType) {
      case 'payment.captured':
        await handlePaymentCaptured(event);
        break;

      case 'payment.failed':
        await handlePaymentFailed(event);
        break;

      case 'payment.authorized':
        // Payment authorized but not captured yet - no action needed
        logger.info({ paymentId: event.payload?.payment?.entity?.id }, 'Payment authorized');
        break;

      default:
        logger.debug({ eventType }, 'Unhandled webhook event type');
    }

    // Always return 200 to acknowledge receipt
    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Webhook processing failed');

    // Return 500 so Razorpay will retry
    return new Response(
      JSON.stringify({ error: 'Webhook processing failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Handle payment.captured event
 * Create order if it doesn't exist (idempotency)
 */
async function handlePaymentCaptured(event) {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const orderId = payment.order_id;
  const amount = payment.amount;

  logger.info({ paymentId, orderId, amount }, 'Processing payment.captured event');

  try {
    // Check if order already exists (idempotency)
    const existingOrder = await OrderModel.findOne({ order_id: orderId });

    if (existingOrder) {
      logger.info({ orderId, existingOrderId: existingOrder._id }, 'Order already exists - skipping creation');
      return;
    }

    // Fetch Razorpay order to get metadata (cart items, shipping address)
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.fetch(orderId);
    const notes = razorpayOrder.notes || {};

    // Parse metadata from notes
    const cartItems = notes.cartItems ? JSON.parse(notes.cartItems) : [];
    const shippingAddress = notes.shippingAddress ? JSON.parse(notes.shippingAddress) : {};
    const userId = notes.userId !== 'guest' ? notes.userId : null;

    if (!cartItems.length || !shippingAddress.email) {
      logger.error({ orderId }, 'Missing cart items or shipping address in Razorpay order notes');
      throw new Error('Incomplete order metadata');
    }

    // Start transaction to create order and deduct stock
    const session = await OrderModel.startSession();

    try {
      session.startTransaction();

      // Deduct stock for each item
      for (const item of cartItems) {
        const isFallbackVariant = !item.variantId ||
                                  item.variantId === 'null' ||
                                  item.variantId.startsWith('fallback-');

        if (isFallbackVariant) {
          // Handle fallback variants
          const productId = item.variantId?.startsWith('fallback-')
            ? item.variantId.replace('fallback-', '')
            : item.productId;

          const result = await ProductModel.findOneAndUpdate(
            {
              _id: productId,
              quantity: { $gte: item.quantity }
            },
            {
              $inc: { quantity: -item.quantity }
            },
            { session, new: true }
          );

          if (!result) {
            throw new Error(`Stock deduction failed for product: ${productId}`);
          }

          if (result.quantity === 0) {
            await ProductModel.findByIdAndUpdate(
              result._id,
              { isAvailable: false, soldAt: new Date() },
              { session }
            );
          }
        } else {
          // Handle real variants
          const result = await ProductVariantModel.findOneAndUpdate(
            {
              _id: item.variantId,
              quantity: { $gte: item.quantity }
            },
            {
              $inc: { quantity: -item.quantity }
            },
            { session, new: true }
          ).populate('product');

          if (!result) {
            throw new Error(`Stock deduction failed for variant: ${item.variantId}`);
          }

          if (result.quantity === 0 && result.product) {
            await ProductModel.findByIdAndUpdate(
              result.product._id,
              { isAvailable: false, soldAt: new Date() },
              { session }
            );
          }
        }
      }

      // Calculate totals from cart items
      const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const totalAmount = amount / 100; // Convert from paise to rupees

      // Create order
      const newOrder = await OrderModel.create([{
        user: userId,
        name: shippingAddress.name,
        email: shippingAddress.email,
        phone: shippingAddress.phone,
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        pincode: shippingAddress.pincode,
        landmark: shippingAddress.landmark || '',
        ordernote: '',
        products: cartItems.map(item => ({
          productId: item.productId,
          variantId: item.variantId,
          name: item.name,
          qty: item.quantity,
          mrp: item.price,
          sellingPrice: item.price,
        })),
        subtotal,
        discount: 0,
        couponDiscountAmount: 0,
        totalAmount,
        payment_id: paymentId,
        order_id: orderId,
        status: 'pending',
      }], { session });

      await session.commitTransaction();

      logger.info({
        orderId,
        orderDbId: newOrder[0]._id,
        email: shippingAddress.email,
      }, 'Order created successfully via webhook');

      // Send order confirmation email (async, don't block)
      try {
        const mailData = {
          order_id: orderId,
          orderDetailsUrl: `${config.NEXT_PUBLIC_BASE_URL}/order-details/${orderId}`,
        };
        await sendMail('Order placed successfully.', shippingAddress.email, orderNotification(mailData));
        logger.info({ orderId, email: shippingAddress.email }, 'Order confirmation email sent');
      } catch (emailError) {
        logger.warn({ orderId, error: emailError.message }, 'Failed to send confirmation email');
      }

    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }

  } catch (error) {
    logger.error({
      orderId,
      paymentId,
      error: error.message,
      stack: error.stack,
    }, 'Failed to process payment.captured webhook');
    throw error;
  }
}

/**
 * Handle payment.failed event
 * Unlock stock if it was locked
 */
async function handlePaymentFailed(event) {
  const payment = event.payload.payment.entity;
  const paymentId = payment.id;
  const orderId = payment.order_id;

  logger.info({ paymentId, orderId }, 'Processing payment.failed event');

  try {
    // Fetch Razorpay order to get lockId from notes
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const razorpayOrder = await razorpay.orders.fetch(orderId);
    const lockId = razorpayOrder.notes?.lockId;

    if (lockId) {
      // Stock was locked - need to unlock it
      // However, the cleanup job will handle this automatically based on lockExpiresAt
      logger.info({ lockId, orderId }, 'Payment failed - stock will be unlocked by cleanup job');
    }

    logger.info({ paymentId, orderId, reason: payment.error_description }, 'Payment failed');
  } catch (error) {
    logger.error({
      orderId,
      paymentId,
      error: error.message,
    }, 'Failed to process payment.failed webhook');
  }
}
