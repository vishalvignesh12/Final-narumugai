import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import SliderModel from "@/models/Slider.model";
import { isAuthenticated } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";

export async function GET(request, { params }) {
    try {
        await connectDB()

        const getParams = await params
        const id = getParams.id

        if (!isValidObjectId(id)) {
            return response(false, 400, 'Invalid slider ID.')
        }

        const slider = await SliderModel.findOne({ 
            _id: id,
            deletedAt: null 
        }).populate('mediaId').lean()

        if (!slider) {
            return response(false, 404, 'Slider not found.')
        }

        return response(true, 200, 'Slider retrieved successfully.', slider)

    } catch (error) {
        return catchError(error)
    }
}