import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";

// Cache featured products for 5 minutes (300 seconds)
export const revalidate = 300;

export async function GET(request) {
    try {
        await connectDB()

        const products = await ProductModel.find({ deletedAt: null, isAvailable: true })
            .populate('media')
            .populate('category', 'name slug')
            .sort({ createdAt: -1 })
            .limit(10)
            .lean(); // Use .lean() for faster read-only queries

        return response(true, 200, "Featured products fetched", products)

    } catch (error) {
        return catchError(error)
    }
}