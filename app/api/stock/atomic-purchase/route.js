import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { z } from "zod";

const atomicPurchaseSchema = z.object({
    items: z.array(z.object({
        variantId: z.string(), // Accept any string - validation handled in the function
        quantity: z.union([
            z.number().min(1, 'Quantity must be at least 1'),
            z.string().transform(val => {
                const num = parseInt(val, 10);
                if (isNaN(num) || num < 1) {
                    throw new Error('Quantity must be a valid number >= 1');
                }
                return num;
            })
        ]).default(1)
    }))
});

/**
 * Atomically decrements stock for a product purchase
 * Ensures only one customer can buy when stock is limited
 */
async function atomicStockPurchase(variantId, quantity = 1, session = null) {
    try {
        // Handle fallback variants (products without real variants)
        if (!variantId || variantId === 'null' || variantId.includes('fallback-')) {
            const productId = variantId?.startsWith('fallback-') 
                ? variantId.replace('fallback-', '') 
                : variantId;

            // Atomic stock deduction at product level
            const result = await ProductModel.findOneAndUpdate(
                {
                    _id: productId,
                    quantity: { $gte: quantity }, // Only proceed if stock >= quantity
                    isAvailable: true
                },
                {
                    $inc: { quantity: -quantity }
                },
                {
                    new: true,
                    session
                }
            );

            if (!result) {
                throw new Error('Out of stock - Product not available or insufficient quantity');
            }

            // Mark as sold out if quantity reaches 0
            if (result.quantity === 0) {
                await ProductModel.findByIdAndUpdate(
                    result._id,
                    {
                        isAvailable: false,
                        soldAt: new Date()
                    },
                    { session }
                );
            }

            return {
                success: true,
                productId: result._id,
                productName: result.name,
                purchasedQuantity: quantity,
                remainingStock: result.quantity,
                type: 'product-level'
            };
        }

        // Handle real product variants
        const result = await ProductVariantModel.findOneAndUpdate(
            {
                _id: variantId,
                quantity: { $gte: quantity } // Only proceed if stock >= quantity
            },
            {
                $inc: { quantity: -quantity }
            },
            {
                new: true,
                session
            }
        ).populate('product', 'name isAvailable');

        if (!result) {
            throw new Error('Out of stock - Variant not available or insufficient quantity');
        }

        // Check if parent product is available
        if (!result.product.isAvailable) {
            throw new Error('Product is no longer available');
        }

        return {
            success: true,
            variantId: result._id,
            productId: result.product._id,
            productName: result.product.name,
            purchasedQuantity: quantity,
            remainingStock: result.quantity,
            type: 'variant-level'
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

export async function POST(request) {
    try {
        await connectDB();
        
        const payload = await request.json();
        console.log('Received payload:', JSON.stringify(payload, null, 2));
        
        const validate = atomicPurchaseSchema.safeParse(payload);
        
        if (!validate.success) {
            console.error('Validation error:', validate.error.issues);
            
            // Create more detailed error message
            const errorMessages = validate.error.issues.map(issue => 
                `${issue.path.join('.')}: ${issue.message}`
            ).join(', ');
            
            return response(false, 400, `Invalid or missing fields: ${errorMessages}`, validate.error);
        }

        const { items } = validate.data;
        
        // Use session for transaction to ensure atomicity across multiple items
        const session = await ProductVariantModel.startSession();
        
        try {
            session.startTransaction();
            
            const purchaseResults = [];
            
            for (const item of items) {
                const result = await atomicStockPurchase(item.variantId, item.quantity, session);
                
                if (!result.success) {
                    throw new Error(result.error);
                }
                
                purchaseResults.push(result);
            }
            
            await session.commitTransaction();
            
            return response(true, 200, 'Stock purchased successfully', {
                purchaseResults
            });
            
        } catch (error) {
            await session.abortTransaction();
            console.error('Atomic purchase error:', error);
            
            // Return proper error response structure
            return response(false, 400, error.message || 'Stock purchase failed');
        } finally {
            session.endSession();
        }
        
    } catch (error) {
        return catchError(error);
    }
}