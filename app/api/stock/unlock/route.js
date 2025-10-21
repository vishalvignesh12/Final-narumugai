import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";
import { applyRateLimit, stockLockRateLimiter } from "@/lib/rateLimiter";
import { validateCheckoutSession } from "@/lib/sessionManager";
import { validateCsrfMiddleware } from "@/lib/csrfProtection";
import logger from "@/lib/logger";

const stockUnlockSchema = z.object({
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
        const validate = stockUnlockSchema.safeParse(payload)
        
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { items, sessionToken } = validate.data

        // Validate checkout session
        const session = await validateCheckoutSession(sessionToken, null);
        if (!session) {
            logger.warn({ itemCount: items.length }, 'Stock unlock failed: Invalid session');
            return response(false, 401, 'Invalid or expired checkout session');
        }
        
        // Use session for transaction to ensure atomicity
        const dbSession = await ProductVariantModel.startSession()
        
        try {
            dbSession.startTransaction()
            
            const unlockResults = []
            
            for (const item of items) {
                // Handle fallback variants (products without real variants)
                if (!item.variantId || item.variantId === 'null' || item.variantId.includes('fallback-')) {
                    // Extract product ID from fallback variant ID
                    const productId = item.variantId?.startsWith('fallback-') 
                        ? item.variantId.replace('fallback-', '') 
                        : item.variantId
                    
                    // For products without variants, unlock at product level
                    const result = await ProductModel.findOneAndUpdate(
                        {
                            _id: productId,
                            lockedQuantity: { $gte: item.quantity }
                        },
                        {
                            $inc: { lockedQuantity: -item.quantity },
                            $set: { lockExpiresAt: null }
                        },
                        {
                            new: true,
                            session: dbSession
                        }
                    ).lean()
                    
                    if (result) {
                        unlockResults.push({
                            variantId: item.variantId,
                            productName: result.name,
                            unlockedQuantity: item.quantity,
                            remainingLocked: result.lockedQuantity,
                            type: 'product-level'
                        })
                    }
                    
                    continue
                }
                
                // Handle real variants
                // Atomic update to unlock stock
                const result = await ProductVariantModel.findOneAndUpdate(
                    {
                        _id: item.variantId,
                        lockedQuantity: { $gte: item.quantity }
                    },
                    {
                        $inc: { lockedQuantity: -item.quantity },
                        $set: { lockExpiresAt: null }
                    },
                    {
                        new: true,
                        session: dbSession
                    }
                ).populate('product', 'name').lean()
                
                if (result) {
                    unlockResults.push({
                        variantId: item.variantId,
                        productName: result.product.name,
                        unlockedQuantity: item.quantity,
                        remainingLocked: result.lockedQuantity,
                        type: 'variant-level'
                    })
                }
            }
            
            await dbSession.commitTransaction()

            logger.info({
                sessionId: session.sessionId,
                itemCount: items.length,
                unlockedCount: unlockResults.length,
            }, 'Stock unlocked successfully');
            
            return response(true, 200, 'Stock unlocked successfully', {
                unlockResults
            })
            
        } catch (error) {
            await dbSession.abortTransaction()
            logger.error({
                sessionId: session.sessionId,
                error: (error as any).message,
                itemCount: items.length,
            }, 'Stock unlock failed');
            throw error
        } finally {
            dbSession.endSession()
        }
        
    } catch (error) {
        return catchError(error)
    }
}