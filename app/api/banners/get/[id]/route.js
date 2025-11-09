import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import BannerModel from "@/models/Banner.model";

// Cache banners for 1 day (86400 seconds)
export const revalidate = 86400;

export async function GET(request) {
    try {
        await connectDB();
        const banners = await BannerModel.find({ deletedAt: null }).sort({ createdAt: -1 }).lean();
        return response(true, 200, 'Banners retrieved successfully.', banners);
    } catch (error) {
        return catchError(error);
    }
}