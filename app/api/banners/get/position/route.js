import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import BannerModel from "@/models/Banner.model";

export async function GET(request) {
    try {
        await connectDB()

        const searchParams = request.nextUrl.searchParams;
        const position = searchParams.get('position') || 'homepage-top';

        const filter = {
            isActive: true,
            deletedAt: null
        }
        
        if (position) {
            filter.position = position
        }

        const banners = await BannerModel.find(filter)
            .populate('mediaId')
            .sort({ order: 1, createdAt: -1 })
            .lean()

        return response(true, 200, 'Banners retrieved successfully.', banners)

    } catch (error) {
        return catchError(error)
    }
}