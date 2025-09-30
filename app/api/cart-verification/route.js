import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        // Simple cart data mapping without complex verification
        const verifiedCartData = await Promise.all(
            payload.map(async (cartItem) => {
                const variant = await ProductVariantModel.findById(cartItem.variantId).populate('product').populate('media', 'secure_url').lean()
                if (variant && variant.product) {
                    return {
                        productId: variant.product._id,
                        variantId: variant._id,
                        name: variant.product.name,
                        url: variant.product.slug,
                        size: variant.size,
                        color: variant.color,
                        mrp: variant.mrp,
                        sellingPrice: variant.sellingPrice,
                        media: variant?.media[0]?.secure_url,
                        qty: cartItem.qty || 1
                    }
                }
                return null
            })
        )

        // Filter out null values
        const filteredCartData = verifiedCartData.filter(item => item !== null)


        return response(true, 200, 'Verified Cart Data.', filteredCartData)

    } catch (error) {
        return catchError(error)
    }
}