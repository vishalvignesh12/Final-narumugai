import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import CategoryModel from "@/models/Category.model";
import { cloudinary } from "@/lib/cloudinary";

export async function POST(request) {
    try {
        await connectDB()
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const { _id } = await request.json()
        if (!_id) {
            return response(false, 400, 'Media ID is required.')
        }

        const findMedia = await MediaModel.findById(_id)
        if (!findMedia) {
            return response(false, 404, 'Media not found.')
        }

        // ** PRODUCTION-LEVEL FIX: Check if media is in use before deleting **

        // 1. Check if media is in use by a Product
        const productInUse = await ProductModel.exists({ media: _id });
        if (productInUse) {
            return response(false, 400, 'Cannot delete. This image is in use by one or more products.');
        }

        // 2. Check if media is in use by a Product Variant
        const variantInUse = await ProductVariantModel.exists({ media: _id });
        if (variantInUse) {
            return response(false, 400, 'Cannot delete. This image is in use by one or more product variants.');
        }
        
        // 3. Check if media is in use by a Category
        const categoryInUse = await CategoryModel.exists({ media: _id });
        if (categoryInUse) {
            return response(false, 400, 'Cannot delete. This image is in use by one or more categories.');
        }

        // ** Add more checks here for Banners, Sliders, etc. if they use MediaModel **

        // 4. If no conflicts, proceed with deletion
        await cloudinary.uploader.destroy(findMedia.public_id)
        await MediaModel.findByIdAndDelete(_id)

        return response(true, 200, 'Media deleted successfully.')

    } catch (error) {
        return catchError(error)
    }
}