import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";

// --- FIX: Allow 'variantId' to be nullable ---
const stockUnlockSchema = z.object({
    items: z.array(z.object({
        variantId: z.string().nullable(), // <-- THIS LINE IS FIXED
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
                    
                    const productId = item.variantId?.startsWith('fallback-') 
                        ? item.variantId.replace('fallback-', '') 
                        : item.variantId // This might be null
                    
                    // --- FIX: Increment 'quantity' field, not 'lockedQuantity' ---
                    const result = await ProductModel.findOneAndUpdate(
                        { _id: productId },
                        {
                            $inc: { quantity: item.quantity }, // Add quantity back
                            isAvailable: true // Make sure it's available
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
                            remainingStock: result.quantity, // Show new stock
                            type: 'product-level'
                        })
                    }
                    
                    continue
                }
                
                // Handle real variants
                // --- FIX: Increment 'quantity' field, not 'lockedQuantity' ---
                const result = await ProductVariantModel.findOneAndUpdate(
                    { _id: item.variantId },
                    {
                        $inc: { quantity: item.quantity } // Add quantity back
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
                        remainingStock: result.quantity, // Show new stock
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