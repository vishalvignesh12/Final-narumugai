import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import BannerModel from "@/models/Banner.model";
import { isAuthenticated } from "@/lib/authentication";
import { isValidObjectId } from "mongoose";

export async function GET(request, { params }) {
    try {
        await connectDB()

        const getParams = await params
        const id = getParams.id

        if (!isValidObjectId(id)) {
            return response(false, 400, 'Invalid banner ID.')
        }

        const banner = await BannerModel.findOne({ 
            _id: id,
            deletedAt: null 
        }).populate('mediaId').lean()

        if (!banner) {
            return response(false, 404, 'Banner not found.')
        }

        return response(true, 200, 'Banner retrieved successfully.', banner)

    } catch (error) {
        return catchError(error)
    }
}