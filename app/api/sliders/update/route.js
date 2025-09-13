import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SliderModel from "@/models/Slider.model";
import { isAuthenticated } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";

export async function PUT(request) {
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

        const updateData = {}
        if (payload.mediaId !== undefined) updateData.mediaId = payload.mediaId
        if (payload.title !== undefined) updateData.title = payload.title
        if (payload.alt !== undefined) updateData.alt = payload.alt
        if (payload.link !== undefined) updateData.link = payload.link
        if (payload.order !== undefined) updateData.order = payload.order
        if (payload.isActive !== undefined) updateData.isActive = payload.isActive

        const updatedSlider = await SliderModel.findByIdAndUpdate(
            payload.id,
            updateData,
            { new: true, runValidators: true }
        ).populate('mediaId').lean()

        if (!updatedSlider) {
            return response(false, 404, 'Slider not found.')
        }

        return response(true, 200, 'Slider updated successfully.', updatedSlider)

    } catch (error) {
        return catchError(error)
    }
}