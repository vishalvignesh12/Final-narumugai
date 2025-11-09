import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import CategoryModel from "@/models/Category.model";

// Cache categories for 1 day (86400 seconds)
export const revalidate = 86400;

export async function GET(request) {
    try {
        await connectDB();
        const categories = await CategoryModel.find({ deletedAt: null }).sort({ sequence: 1 }).lean();
        return response(true, 200, 'Categories retrieved successfully.', categories);
    } catch (error) {
        return catchError(error);
    }
}