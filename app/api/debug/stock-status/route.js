import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET(request) {
    try {
        await connectDB()
        
        const searchParams = request.nextUrl.searchParams
        const variantId = searchParams.get('variantId')
        
        if (variantId) {
            // Get specific variant details
            const variant = await ProductVariantModel.findById(variantId)
                .populate('product', 'name isAvailable quantity lockedQuantity')
                .lean()
            
            if (!variant) {
                return response(false, 404, 'Variant not found')
            }
            
            return response(true, 200, 'Variant details', {
                variant,
                availableQuantity: (variant.quantity || 0) - (variant.lockedQuantity || 0),
                canPurchase: variant.product.isAvailable && ((variant.quantity || 0) - (variant.lockedQuantity || 0)) > 0
            })
        }
        
        // Get sample variants with stock info
        const variants = await ProductVariantModel.find({}, 'sku quantity lockedQuantity')
            .populate('product', 'name isAvailable quantity lockedQuantity')
            .limit(10)
            .lean()
        
        const variantStats = variants.map(variant => ({
            variantId: variant._id,
            productName: variant.product.name,
            sku: variant.sku,
            productAvailable: variant.product.isAvailable,
            variantQuantity: variant.quantity || 0,
            variantLocked: variant.lockedQuantity || 0,
            productQuantity: variant.product.quantity || 0,
            productLocked: variant.product.lockedQuantity || 0,
            availableStock: (variant.quantity || 0) - (variant.lockedQuantity || 0),
            canPurchase: variant.product.isAvailable && ((variant.quantity || 0) - (variant.lockedQuantity || 0)) > 0
        }))
        
        return response(true, 200, 'Stock status check', {
            totalVariants: await ProductVariantModel.countDocuments(),
            variantStats
        })
        
    } catch (error) {
        return catchError(error)
    }
}