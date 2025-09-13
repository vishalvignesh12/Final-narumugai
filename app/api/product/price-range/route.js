import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET() {
    try {
        await connectDB()

        // Get min and max prices from all active product variants
        const priceRange = await ProductVariantModel.aggregate([
            {
                $match: {
                    deletedAt: null
                }
            },
            {
                $group: {
                    _id: null,
                    minPrice: { $min: "$sellingPrice" },
                    maxPrice: { $max: "$sellingPrice" }
                }
            }
        ])

        // Default values if no products found
        const defaultRange = { minPrice: 0, maxPrice: 5000 }
        const actualRange = priceRange.length > 0 ? priceRange[0] : defaultRange

        // Round prices for better UX
        const roundedMin = Math.floor(actualRange.minPrice / 100) * 100
        const roundedMax = Math.ceil(actualRange.maxPrice / 100) * 100

        return response(true, 200, 'Price range retrieved successfully.', {
            minPrice: roundedMin,
            maxPrice: roundedMax
        })

    } catch (error) {
        return catchError(error)
    }
}