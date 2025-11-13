import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CarouselModel from "@/models/Carousel.model";
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
            return response(false, 400, 'Valid carousel ID is required.')
        }

        // Soft delete by setting deletedAt
        const deletedCarousel = await CarouselModel.findByIdAndUpdate(
            payload.id,
            { deletedAt: new Date() },
            { new: true }
        )

        if (!deletedCarousel) {
            return response(false, 404, 'Carousel not found.')
        }

        return response(true, 200, 'Carousel deleted successfully.')

    } catch (error) {
        return catchError(error)
    }
}