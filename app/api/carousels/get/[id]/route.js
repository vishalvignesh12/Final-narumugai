import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CarouselModel from "@/models/Carousel.model";
import { isAuthenticated } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";

export async function GET(request, { params }) {
    try {
        await connectDB()

        const getParams = await params
        const id = getParams.id

        if (!isValidObjectId(id)) {
            return response(false, 400, 'Invalid carousel ID.')
        }

        const carousel = await CarouselModel.findOne({ 
            _id: id,
            deletedAt: null 
        }).populate('mediaId').lean()

        if (!carousel) {
            return response(false, 404, 'Carousel not found.')
        }

        return response(true, 200, 'Carousel retrieved successfully.', carousel)

    } catch (error) {
        return catchError(error)
    }
}