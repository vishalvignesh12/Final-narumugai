import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";

// --- FIX: Allow 'variantId' to be nullable ---
const stockLockSchema = z.object({
    items: z.array(z.object({
        variantId: z.string().nullable(), // <-- THIS LINE IS FIXED
        quantity: z.number().min(1, 'Quantity must be at least 1').default(1)
    }))
});

export async function POST(request) {
    try {
        await connectDB()
        
        const payload = await request.json()
        const validate = stockLockSchema.safeParse(payload)
        
        if (!validate.success) {
            return response(false, 400, 'Invalid or missing fields.', validate.error)
        }

        const { items } = validate.data
        
        // Use session for transaction to ensure atomicity
        const session = await ProductVariantModel.startSession()
        
        try {
            session.startTransaction()
            
            const lockResults = []
            
            for (const item of items) {
                let checkResult;

                // Handle fallback variants (products without real variants)
                // This logic correctly runs if variantId is null, undefined, or 'fallback-'
                if (!item.variantId || item.variantId === 'null' || item.variantId.includes('fallback-')) {
                    
                    const productId = item.variantId?.startsWith('fallback-') 
                        ? item.variantId.replace('fallback-', '') 
                        : item.variantId // This might be null, which is fine for the findOneAndUpdate query
                    
                    checkResult = await ProductModel.findOneAndUpdate(
                        {
                            _id: productId,
                            quantity: { $gte: item.quantity },
                            isAvailable: true
                        },
                        {
                            $inc: { quantity: -item.quantity }, // Decrement stock
                            // Optional: Set isAvailable to false if stock hits 0
                            $set: {
                                isAvailable: {
                                    $cond: {
                                        if: { $lte: [{ $subtract: ["$quantity", item.quantity] }, 0] },
                                        then: false,
                                        else: true
                                    }
                                }
                            }
                        },
                        {
                            new: true,
                            session
                        }
                    ).lean()
                    
                    if (!checkResult) {
                        const product = await ProductModel.findById(productId).select('name quantity').lean();
                        throw new Error(`'${product?.name || 'Product'}' is out of stock. Only ${product?.quantity || 0} left.`);
                    }

                    lockResults.push({
                        variantId: item.variantId,
                        lockedQuantity: item.quantity,
                        remainingStock: checkResult.quantity,
                        type: 'product-level'
                    });
                    
                    continue; // Move to next item
                }
                
                // Handle real variants
                checkResult = await ProductVariantModel.findOneAndUpdate(
                    {
                        _id: item.variantId,
                        quantity: { $gte: item.quantity }
                    },
                    {
                        $inc: { quantity: -item.quantity } // Decrement stock
                    },
                    {
                        new: true,
                        session
                    }
                ).populate('product', 'name').lean()
                
                if (!checkResult) {
                    const variant = await ProductVariantModel.findById(item.variantId).select('quantity').populate('product', 'name').lean();
                    throw new Error(`The product '${variant?.product?.name || 'Item'}' (${variant?.color} / ${variant?.size}) is out of stock. Only ${variant?.quantity || 0} left.`);
                }

                lockResults.push({
                    variantId: item.variantId,
                    lockedQuantity: item.quantity,
                    remainingStock: checkResult.quantity,
                    type: 'variant-level'
                });
            }
            
            // If all locks succeed, commit transaction
            await session.commitTransaction()
            
            return response(true, 200, 'Stock locked successfully', {
                lockedItems: lockResults
            })
            
        } catch (error) {
            // If any lock fails, abort transaction (rolls back all changes)
            await session.abortTransaction()
            throw error // Re-throw to be caught by outer catch block
        } finally {
            session.endSession()
        }
        
    } catch (error) {
        // This catches errors from validation, DB connection, or the transaction
        return response(false, 400, error.message || 'Failed to lock stock.', {
            error: error.message
        })
    }
}