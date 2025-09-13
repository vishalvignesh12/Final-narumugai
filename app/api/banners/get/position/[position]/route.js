import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import BannerModel from "@/models/Banner.model";

export async function GET(request) {
    try {
        await connectDB()

        const searchParams = request.nextUrl.searchParams;
        const position = searchParams.get('position');

        if (!position) {
            return response(false, 400, 'Position parameter is required.')
        }

        const banners = await BannerModel.find({
            position: position,
            isActive: true,
            deletedAt: null
        })
        .populate('mediaId')
        .sort({ order: 1, createdAt: -1 })
        .lean()

        return response(true, 200, 'Banners retrieved successfully.', banners)

    } catch (error) {
        return catchError(error)
    }
}