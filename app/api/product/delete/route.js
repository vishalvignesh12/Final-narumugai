import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { isAuthenticated } from "@/lib/authentication";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function PUT(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const ids = payload.ids || []
        const deleteType = payload.deleteType

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        if (!['SD', 'RSD'].includes(deleteType)) {
            return response(false, 400, 'Invalid delete operation. Delete type should be SD or RSD for this route.')
        }

        if (deleteType === 'SD') {
            const products = await ProductModel.find({ _id: { $in: ids }, deletedAt: null }).select('_id').lean()
            if (products.length !== new Set(ids.map(String)).size) {
                return response(false, 404, 'One or more active products were not found.')
            }

            const deletedAt = new Date()
            const productIds = products.map(product => product._id)
            await ProductModel.updateMany({ _id: { $in: productIds }, deletedAt: null }, { $set: { deletedAt } })
            await ProductVariantModel.updateMany(
                { product: { $in: productIds }, deletedAt: null },
                { $set: { deletedAt } }
            )
        } else {
            const products = await ProductModel.find({ _id: { $in: ids }, deletedAt: { $ne: null } }).select('_id deletedAt').lean()
            if (products.length !== new Set(ids.map(String)).size) {
                return response(false, 404, 'One or more trashed products were not found.')
            }

            for (const product of products) {
                await ProductVariantModel.updateMany(
                    { product: product._id, deletedAt: product.deletedAt },
                    { $set: { deletedAt: null } }
                )
            }
            await ProductModel.updateMany({ _id: { $in: products.map(product => product._id) }, deletedAt: { $ne: null } }, { $set: { deletedAt: null } })
        }


        return response(true, 200, deleteType === 'SD' ? 'Data moved into trash.' : "Data restored.")

    } catch (error) {
        return catchError(error)
    }
}


export async function DELETE(request) {

    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()
        const payload = await request.json()

        const ids = payload.ids || []
        const deleteType = payload.deleteType

        if (!Array.isArray(ids) || ids.length === 0) {
            return response(false, 400, 'Invalid or empty id list.')
        }

        if (deleteType !== 'PD') {
            return response(false, 400, 'Invalid delete operation. Delete type should be PD for this route.')
        }

        const products = await ProductModel.find({ _id: { $in: ids }, deletedAt: { $ne: null } }).select('_id').lean()
        if (products.length !== new Set(ids.map(String)).size) {
            return response(false, 409, 'Only products already in trash can be permanently deleted.')
        }

        const productIds = products.map(product => product._id)
        await ProductVariantModel.deleteMany({ product: { $in: productIds } })
        await ProductModel.deleteMany({ _id: { $in: productIds }, deletedAt: { $ne: null } })

        return response(true, 200, 'Data deleted permanently')
    } catch (error) {
        return catchError(error)
    }
}
