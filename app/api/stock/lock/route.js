import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";
import { applyRateLimit, stockLockRateLimiter } from "@/lib/rateLimiter";
import { validateCheckoutSession } from "@/lib/sessionManager";
import { validateCsrfMiddleware } from "@/lib/csrfProtection";
import { config } from "@/lib/envConfig";
import logger from "@/lib/logger";
import crypto from "crypto";

const stockLockSchema = z.object({
    items: z.array(z.object({
        variantId: z.string().length(24, 'Invalid variant id format'),
        quantity: z.number().min(1, 'Quantity must be at least 1').default(1)
    })),
    sessionToken: z.string().min(1, 'Session token required'),
});

export async function POST(request) {
    try {
        // Apply rate limiting
        const rateLimitResult = await applyRateLimit(request, stockLockRateLimiter);
        if (rateLimitResult) return rateLimitResult;

        // Validate CSRF token
        const csrfValidation = await validateCsrfMiddleware(request);
        if (!csrfValidation.valid) return csrfValidation.response;

        await connectDB()
        
        const payload = await request.json()
        const validate = stockLockSchema.safeParse(payload)
        
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { items, sessionToken } = validate.data

        // Validate checkout session
        const session = await validateCheckoutSession(sessionToken, null);
        if (!session) {
            logger.warn({ itemCount: items.length }, 'Stock lock failed: Invalid session');
            return response(false, 401, 'Invalid or expired checkout session');
        }

        // Generate lock ID for tracking
        const lockId = crypto.randomUUID();
        const lockDurationMs = config.STOCK_LOCK_EXPIRY_MINUTES * 60 * 1000;
        const lockExpiresAt = new Date(Date.now() + lockDurationMs);
        
        // Use session for transaction to ensure atomicity
        const dbSession = await ProductVariantModel.startSession()
        
        try {
            dbSession.startTransaction()
            
            const lockResults = []
            
            for (const item of items) {
                // Handle fallback variants (products without real variants)
                if (!item.variantId || item.variantId === 'null' || item.variantId.includes('fallback-')) {
                    // Extract product ID from fallback variant ID
                    const productId = item.variantId?.startsWith('fallback-') 
                        ? item.variantId.replace('fallback-', '') 
                        : item.variantId
                    
                    // For products without variants, work with the product directly
                    const product = await ProductModel.findById(productId).lean()
                    
                    if (!product) {
                        throw new Error('Product not found')
                    }
                    
                    if (!product.isAvailable) {
                        throw new Error(`Sorry, ${product.name} is no longer available`)
                    }
                    
                    // Check if product has enough stock
                    const availableStock = (product.quantity || 0) - (product.lockedQuantity || 0)
                    if (availableStock < item.quantity) {
                        throw new Error(`Sorry, ${product.name} was just sold out to another customer`)
                    }
                    
                    // Lock stock at product level and set expiration
                    const result = await ProductModel.findByIdAndUpdate(
                        productId,
                        {
                            $inc: { lockedQuantity: item.quantity },
                            $set: { lockExpiresAt: lockExpiresAt }
                        },
                        {
                            new: true,
                            session: dbSession
                        }
                    )
                    
                    if (result) {
                        lockResults.push({
                            variantId: item.variantId,
                            productName: result.name,
                            lockedQuantity: item.quantity,
                            remainingStock: result.quantity - result.lockedQuantity,
                            type: 'product-level'
                        })
                    }
                    
                    continue
                }
                
                // Handle real variants
                // First, ensure the variant has quantity fields set
                await ProductVariantModel.findByIdAndUpdate(
                    item.variantId,
                    {
                        $setOnInsert: {
                            quantity: 10,
                            lockedQuantity: 0
                        }
                    },
                    {
                        upsert: false,
                        session: dbSession
                    }
                )

                // Also handle cases where fields exist but are null
                await ProductVariantModel.findOneAndUpdate(
                    {
                        _id: item.variantId,
                        $or: [
                            { quantity: { $exists: false } },
                            { quantity: null },
                            { lockedQuantity: { $exists: false } },
                            { lockedQuantity: null }
                        ]
                    },
                    {
                        $set: {
                            quantity: 10,
                            lockedQuantity: 0
                        }
                    },
                    {
                        session: dbSession
                    }
                )

                // Now attempt to lock stock - only succeeds if quantity is available
                const result = await ProductVariantModel.findOneAndUpdate(
                    {
                        _id: item.variantId,
                        $expr: {
                            $gte: [
                                { $subtract: ["$quantity", "$lockedQuantity"] },
                                item.quantity
                            ]
                        }
                    },
                    {
                        $inc: { lockedQuantity: item.quantity },
                        $set: { lockExpiresAt: lockExpiresAt }
                    },
                    {
                        new: true,
                        session: dbSession
                    }
                ).populate('product', 'name isAvailable').lean()
                
                if (!result) {
                    // Stock locking failed - check why
                    const variant = await ProductVariantModel.findById(item.variantId)
                        .populate('product', 'name isAvailable')
                        .session(dbSession)
                        .lean()
                    
                    if (!variant) {
                        throw new Error(`Product variant not found`)
                    }
                    
                    if (!variant.product.isAvailable) {
                        throw new Error(`Sorry, ${variant.product.name} is no longer available`)
                    }
                    
                    // This is the key message for "first-to-pay-wins"
                    throw new Error(`Sorry, ${variant.product.name} was just sold out to another customer`)
                }
                
                // Check if product is still available
                if (!result.product.isAvailable) {
                    throw new Error(`${result.product.name} is no longer available`)
                }
                
                lockResults.push({
                    variantId: item.variantId,
                    productName: result.product.name,
                    lockedQuantity: item.quantity,
                    remainingStock: result.quantity - result.lockedQuantity,
                    type: 'variant-level'
                })
            }
            
            await dbSession.commitTransaction()

            logger.info({
                lockId,
                sessionId: session.sessionId,
                itemCount: items.length,
                expiresAt: lockExpiresAt.toISOString(),
            }, 'Stock locked successfully');
            
            return response(true, 200, 'Stock locked successfully', {
                lockId,
                lockResults,
                expiresAt: lockExpiresAt.toISOString()
            })
            
        } catch (error) {
            await dbSession.abortTransaction()
            logger.error({
                sessionId: session.sessionId,
                error: (error as any).message,
                itemCount: items.length,
            }, 'Stock lock failed');
            throw error
        } finally {
            dbSession.endSession()
        }
        
    } catch (error) {
        return catchError(error)
    }
}