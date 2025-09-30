import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";

const stockLockSchema = z.object({
    items: z.array(z.object({
        variantId: z.string().length(24, 'Invalid variant id format'),
        quantity: z.number().min(1, 'Quantity must be at least 1').default(1)
    }))
});

export async function POST(request) {
    try {
        await connectDB()
        
        // Optional authentication - can work for both authenticated and guest users
        const auth = await isAuthenticated('user')
        
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
                    
                    // Lock stock at product level
                    const result = await ProductModel.findByIdAndUpdate(
                        productId,
                        {
                            $inc: { lockedQuantity: item.quantity }
                        },
                        {
                            new: true,
                            session
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
                        session
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
                        session
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
                        $inc: { lockedQuantity: item.quantity }
                    },
                    {
                        new: true,
                        session
                    }
                ).populate('product', 'name isAvailable').lean()
                
                if (!result) {
                    // Stock locking failed - check why
                    const variant = await ProductVariantModel.findById(item.variantId)
                        .populate('product', 'name isAvailable')
                        .session(session)
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
            
            await session.commitTransaction()
            
            return response(true, 200, 'Stock locked successfully', {
                lockResults,
                lockExpiry: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
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