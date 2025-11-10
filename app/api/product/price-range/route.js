import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import CategoryModel from "@/models/Category.model"; // Import CategoryModel

export const revalidate = 60; // Cache price range for 1 minute

export async function GET(request) {
    try {
        await connectDB();

        // 1. Get category slug from query
        const searchParams = request.nextUrl.searchParams;
        const categorySlug = searchParams.get('category');

        let matchQuery = { deletedAt: null, isAvailable: true };

        // 2. Add category to match query if it exists
        if (categorySlug) {
            const category = await CategoryModel.findOne({ slug: categorySlug }).select('_id');
            if (category) {
                matchQuery.category = category._id;
            }
        }
        
        // 3. Run aggregation with the match query
        const priceRange = await ProductModel.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    min: { $min: "$sellingPrice" },
                    max: { $max: "$sellingPrice" }
                }
            }
        ]);
        
        if (priceRange.length === 0 || !priceRange[0]) {
            // Default range if no products match
             return response(true, 200, "Price range", { min: 0, max: 50000 });
        }

        // Ensure min and max are not null and round them
        const minPrice = Math.floor(priceRange[0].min || 0);
        const maxPrice = Math.ceil(priceRange[0].max || 50000);

        return response(true, 200, "Price range", { min: minPrice, max: maxPrice });

    } catch (error) {
        return catchError(error);
    }
}