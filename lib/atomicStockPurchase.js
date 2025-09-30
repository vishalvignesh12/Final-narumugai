import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

/**
 * Atomically decrements stock for a product purchase
 * Ensures only one customer can buy when stock is limited
 * 
 * @param {string} variantId - Product variant ID or product ID for products without variants
 * @param {number} quantity - Quantity to purchase (default: 1)
 * @param {object} session - MongoDB session for transaction (optional)
 * @returns {Promise<object>} - Purchase result with product info
 */
export async function atomicStockPurchase(variantId, quantity = 1, session = null) {
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

/**
 * Simplified atomic purchase for single item
 * 
 * @param {string} variantId - Product variant ID or product ID
 * @returns {Promise<object>} - Purchase result
 */
export async function buyOneItem(variantId) {
    return await atomicStockPurchase(variantId, 1);
}