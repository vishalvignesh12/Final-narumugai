import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";
import { isAuthenticated } from "@/lib/authentication";

export async function GET(request) {
    try {
        const auth = await isAuthenticated('admin');
        if (!auth.isAuth) return response(false, 401, 'Unauthorized.');
        await connectDB()
        
        const searchParams = request.nextUrl.searchParams
        const variantId = searchParams.get('variantId')
        
        if (variantId) {
            // Get specific variant details
            const variant = await ProductVariantModel.findById(variantId)
                .populate('product', 'name isAvailable quantity')
                .lean()
            
            if (!variant) {
                return response(false, 404, 'Variant not found')
            }
            
            return response(true, 200, 'Variant details', {
                variant,
                availableQuantity: variant.quantity || 0,
                canPurchase: Boolean(variant.product?.isAvailable) && (variant.quantity || 0) > 0
            })
        }
        
        // Get sample variants with stock info
        const variants = await ProductVariantModel.find({}, 'sku quantity')
            .populate('product', 'name isAvailable quantity')
            .limit(10)
            .lean()
        
        const variantStats = variants.map(variant => ({
            variantId: variant._id,
            productName: variant.product?.name,
            sku: variant.sku,
            productAvailable: Boolean(variant.product?.isAvailable),
            variantQuantity: variant.quantity || 0,
            productQuantity: variant.product?.quantity || 0,
            availableStock: variant.quantity || 0,
            canPurchase: Boolean(variant.product?.isAvailable) && (variant.quantity || 0) > 0
        }))
        
        return response(true, 200, 'Stock status check', {
            totalVariants: await ProductVariantModel.countDocuments(),
            variantStats
        })
        
    } catch (error) {
        return catchError(error)
    }
}
