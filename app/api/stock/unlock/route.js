import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";

const stockUnlockSchema = z.object({
    items: z.array(z.object({
        variantId: z.string().length(24, 'Invalid variant id format'),
        quantity: z.number().min(1, 'Quantity must be at least 1').default(1)
    }))
});

export async function POST(request) {
    try {
        await connectDB()
        
        const payload = await request.json()
        const validate = stockUnlockSchema.safeParse(payload)
        
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { items } = validate.data
        
        // Use session for transaction to ensure atomicity
        const session = await ProductVariantModel.startSession()
        
        try {
            session.startTransaction()
            
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
                            $inc: { lockedQuantity: -item.quantity }
                        },
                        {
                            new: true,
                            session
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
                        $inc: { lockedQuantity: -item.quantity }
                    },
                    {
                        new: true,
                        session
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
            
            await session.commitTransaction()
            
            return response(true, 200, 'Stock unlocked successfully', {
                unlockResults
            })
            
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