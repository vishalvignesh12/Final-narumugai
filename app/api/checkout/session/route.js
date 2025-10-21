import { connectDB } from '@/lib/databaseConnection';
import { catchError, response } from '@/lib/helperFunction';
import { createCheckoutSession } from '@/lib/sessionManager';
import { generateCsrfToken, createCsrfCookie } from '@/lib/csrfProtection';
import { applyRateLimit, globalRateLimiter } from '@/lib/rateLimiter';
import { isAuthenticated } from '@/lib/authentication';
import ProductModel from '@/models/Product.model';
import ProductVariantModel from '@/models/ProductVariant.model';
import logger from '@/lib/logger';
import { z } from 'zod';

/**
 * POST /api/checkout/session
 *
 * Create a checkout session for payment flow
 * Returns session token and CSRF token for secure checkout
 *
 * Supports both authenticated users and guest checkout
 */

const cartItemSchema = z.object({
  productId: z.string().length(24, 'Invalid product ID'),
  variantId: z.string().min(1, 'Variant ID required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  name: z.string().optional(),
  price: z.number().optional(),
});

const sessionRequestSchema = z.object({
  cartItems: z.array(cartItemSchema).min(1, 'Cart cannot be empty'),
});

export async function POST(request) {
  try {
    // Apply rate limiting
    const rateLimitResult = await applyRateLimit(request, globalRateLimiter);
    if (rateLimitResult) return rateLimitResult;

    await connectDB();

    // Check if user is authenticated (optional - supports guest checkout)
    let userId = null;
    try {
      const auth = await isAuthenticated('user');
      if (auth?.user?.id) {
        userId = auth.user.id;
      }
    } catch (error) {
      // Guest checkout - continue without user ID
      logger.debug('Creating guest checkout session');
    }

    // Parse and validate request body
    const payload = await request.json();
    const validate = sessionRequestSchema.safeParse(payload);

    if (!validate.success) {
      return response(false, 400, 'Invalid cart items', { error: validate.error });
    }

    const { cartItems } = validate.data;

    // Validate that products/variants exist and are available
    for (const item of cartItems) {
      // Handle fallback variants (products without real variants)
      if (!item.variantId || item.variantId === 'null' || item.variantId.includes('fallback-')) {
        const productId = item.variantId?.startsWith('fallback-')
          ? item.variantId.replace('fallback-', '')
          : item.productId;

        const product = await ProductModel.findById(productId).select('name isAvailable quantity');

        if (!product) {
          return response(false, 400, `Product not found: ${item.productId}`);
        }

        if (!product.isAvailable) {
          return response(false, 400, `Product no longer available: ${product.name}`);
        }

        const availableStock = (product.quantity || 0) - (product.lockedQuantity || 0);
        if (availableStock < item.quantity) {
          return response(false, 400, `Insufficient stock for: ${product.name}`);
        }
      } else {
        // Handle real variants
        if (item.variantId.length !== 24 || !/^[0-9a-fA-F]{24}$/.test(item.variantId)) {
          return response(false, 400, `Invalid variant ID format: ${item.variantId}`);
        }

        const variant = await ProductVariantModel.findById(item.variantId)
          .populate('product', 'name isAvailable')
          .select('quantity lockedQuantity');

        if (!variant) {
          return response(false, 400, `Product variant not found: ${item.variantId}`);
        }

        if (!variant.product.isAvailable) {
          return response(false, 400, `Product no longer available: ${variant.product.name}`);
        }

        const availableStock = (variant.quantity || 0) - (variant.lockedQuantity || 0);
        if (availableStock < item.quantity) {
          return response(false, 400, `Insufficient stock for: ${variant.product.name}`);
        }
      }
    }

    // Create checkout session
    const { token, sessionId, expiresAt } = await createCheckoutSession({
      cartItems,
      userId,
    });

    // Generate CSRF token
    const csrfToken = generateCsrfToken();

    logger.info(
      {
        sessionId,
        userId,
        itemCount: cartItems.length,
        isGuest: !userId,
      },
      'Checkout session created successfully'
    );

    // Return response with CSRF cookie
    return new Response(
      JSON.stringify({
        success: true,
        statusCode: 200,
        message: 'Checkout session created',
        data: {
          sessionToken: token,
          csrfToken,
          expiresAt: new Date(expiresAt).toISOString(),
          sessionId,
        },
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': createCsrfCookie(csrfToken),
        },
      }
    );
  } catch (error) {
    return catchError(error);
  }
}
