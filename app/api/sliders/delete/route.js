import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SliderModel from "@/models/Slider.model";
import { isAuthenticated } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";

export async function DELETE(request) {
    try {
        const auth = await isAuthenticated('admin')
        if (!auth.isAuth) {
            return response(false, 403, 'Unauthorized.')
        }

        await connectDB()

        const payload = await request.json()
        
        if (!payload.id || !isValidObjectId(payload.id)) {
            return response(false, 400, 'Valid slider ID is required.')
        }

        // Soft delete by setting deletedAt
        const deletedSlider = await SliderModel.findByIdAndUpdate(
            payload.id,
            { deletedAt: new Date() },
            { new: true }
        )

        if (!deletedSlider) {
            return response(false, 404, 'Slider not found.')
        }

        return response(true, 200, 'Slider deleted successfully.')

    } catch (error) {
        return catchError(error)
    }
}