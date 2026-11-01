import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'
import { isProductInventoryLine } from '@/lib/orderInventory'

export async function unlockStock(order, session = null) {
    for (const item of order.products) {
        if (isProductInventoryLine(item)) {
            await ProductModel.findOneAndUpdate(
                { _id: item.productId, deletedAt: null },
                { $inc: { quantity: item.qty }, $set: { isAvailable: true, soldAt: null } },
                { session }
            )
            continue
        }

        const variant = await ProductVariantModel.findOneAndUpdate(
            { _id: item.variantId, deletedAt: null },
            { $inc: { quantity: item.qty }, $set: { soldAt: null } },
            { session }
        ).populate('product', 'name').session(session).lean()

        if (variant?.product) {
            const availableVariants = await ProductVariantModel.countDocuments({
                product: variant.product._id,
                deletedAt: null,
                quantity: { $gt: 0 }
            }).session(session)
            await ProductModel.updateOne(
                { _id: variant.product._id, deletedAt: null },
                { $set: { isAvailable: availableVariants > 0, soldAt: availableVariants > 0 ? null : new Date() } },
                { session }
            )
        }
    }
}
