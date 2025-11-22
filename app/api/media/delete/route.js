import { isAuthenticated } from "@/lib/authentication";
import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import CategoryModel from "@/models/Category.model";
import cloudinary from "@/lib/cloudinary";

// CHANGE: Export DELETE instead of POST to match the useDeleteMutation hook
export async function DELETE(request) {
    try {
        await connectDB()
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 401, 'Unauthorized')
        }

        const payload = await request.json()

        // CHANGE: Handle the 'ids' array sent by the frontend hook
        // The hook sends { ids: ["..."], deleteType: "PD" }
        let idToDelete = payload._id;
        if (!idToDelete && payload.ids && Array.isArray(payload.ids) && payload.ids.length > 0) {
            idToDelete = payload.ids[0]; // Extract the first ID (since Media.jsx deletes one at a time)
        }

        if (!idToDelete) {
            return response(false, 400, 'Media ID is required.')
        }

        const findMedia = await MediaModel.findById(idToDelete)
        if (!findMedia) {
            return response(false, 404, 'Media not found.')
        }

        // 1. Check if media is in use by a Product
        const productInUse = await ProductModel.exists({ media: idToDelete });
        if (productInUse) {
            return response(false, 400, 'Cannot delete. This image is in use by one or more products.');
        }

        // 2. Check if media is in use by a Product Variant
        const variantInUse = await ProductVariantModel.exists({ media: idToDelete });
        if (variantInUse) {
            return response(false, 400, 'Cannot delete. This image is in use by one or more product variants.');
        }

        // 3. Check if media is in use by a Category
        const categoryInUse = await CategoryModel.exists({ media: idToDelete });
        if (categoryInUse) {
            return response(false, 400, 'Cannot delete. This image is in use by one or more categories.');
        }

        // 4. If no conflicts, proceed with Permanent Deletion
        if (findMedia.public_id) {
            try {
                await cloudinary.uploader.destroy(findMedia.public_id)
            } catch (cloudinaryError) {
                console.error("Cloudinary deletion error:", cloudinaryError);
                // Continue to delete from DB even if Cloudinary fails, or handle as needed
            }
        }

        await MediaModel.findByIdAndDelete(idToDelete)

        return response(true, 200, 'Media deleted successfully.')

    } catch (error) {
        return catchError(error)
    }
}