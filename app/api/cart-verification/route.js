import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { isProductInventoryLine } from "@/lib/orderInventory";
import { mapVerifiedLine } from "@/lib/cartVerificationContract";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()

        const verifiedCartData = await Promise.all(
            payload.map(async (cartItem) => {
                if (isProductInventoryLine(cartItem)) {
                    const product = await ProductModel.findOne({
                        _id: cartItem.productId,
                        deletedAt: null,
                        isAvailable: true
                    }).populate('media', 'secure_url').lean()
                    if (!product) return null
                    const line = mapVerifiedLine({
                        source: cartItem,
                        dbLine: {
                            inventoryType: 'product',
                            productId: product._id,
                            name: product.name,
                            url: product.slug,
                            mrp: product.mrp,
                            sellingPrice: product.sellingPrice,
                            media: product.media?.[0]?.secure_url,
                            available: product.quantity
                        }
                    })
                    return line.qty > 0 ? line : null
                }
                const variant = await ProductVariantModel.findOne({
                    _id: cartItem.variantId,
                    deletedAt: null
                }).populate('product').populate('media', 'secure_url').lean()
                if (!variant?.product || variant.product.deletedAt || !variant.product.isAvailable) return null
                const line = mapVerifiedLine({
                    source: cartItem,
                    dbLine: {
                        inventoryType: 'variant',
                        productId: variant.product._id,
                        variantId: variant._id,
                        name: variant.product.name,
                        url: variant.product.slug,
                        size: variant.size,
                        color: variant.color,
                        mrp: variant.mrp,
                        sellingPrice: variant.sellingPrice,
                        media: variant.media?.[0]?.secure_url,
                        available: variant.quantity
                    }
                })
                return line.qty > 0 ? line : null
            })
        )

        // Filter out null values
        const filteredCartData = verifiedCartData.filter(item => item !== null)


        return response(true, 200, 'Verified Cart Data.', filteredCartData)

    } catch (error) {
        return catchError(error)
    }
}