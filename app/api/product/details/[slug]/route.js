import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";

// Cache product details for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET(request, { params }) {
    try {
        await connectDB();
        const { slug } = params;
        const searchParams = request.nextUrl.searchParams;
        const color = searchParams.get('color');
        const size = searchParams.get('size');

        if (!slug) {
            return response(false, 400, "Product slug is required");
        }

        // 1. Find the product
        const product = await ProductModel.findOne({ slug, deletedAt: null, isAvailable: true })
            .populate('media')
            .populate('category', 'name slug')
            .lean();

        if (!product) {
            return response(false, 404, "Product not found");
        }

        // 2. Find all available variants for this product
        const allVariants = await ProductVariantModel.find({
            product: product._id,
            deletedAt: null
        })
            .populate('media')
            .lean();

        if (allVariants.length === 0) {
            // Handle products with no variants (using base product details)
            const reviewCount = await ReviewModel.countDocuments({ product: product._id });

            // Create a "fallback" variant from the product itself
            const fallbackVariant = {
                _id: `fallback-${product._id}`, // Create a unique fallback ID
                product: product._id,
                color: "Default",
                size: "One Size",
                mrp: product.mrp,
                sellingPrice: product.sellingPrice,
                discountPercentage: product.discountPercentage,
                sku: product.sku || `fallback-${product._id}`,
                quantity: product.quantity,
                media: product.media,
            };

            return response(true, 200, "Product details retrieved", {
                product,
                variant: fallbackVariant,
                colors: ["Default"],
                sizes: ["One Size"],
                reviewCount: reviewCount
            });
        }

        // 3. Determine unique colors and sizes
        const colors = [...new Set(allVariants.map(v => v.color))];
        const sizes = [...new Set(allVariants.map(v => v.size))];

        // 4. Find the variant to display
        let variantToDisplay;

        if (color && size) {
            // Try to find exact match
            variantToDisplay = allVariants.find(v => v.color === color && v.size === size);
        }

        if (!variantToDisplay && color) {
            // If no exact match, find first variant with the specified color
            variantToDisplay = allVariants.find(v => v.color === color);
        }

        if (!variantToDisplay && size) {
            // If still no match, find first variant with the specified size
            variantToDisplay = allVariants.find(v => v.size === size);
        }

        if (!variantToDisplay) {
            // If no query params or no match, default to the first variant
            variantToDisplay = allVariants[0];
        }

        // 5. Get review count
        const reviewCount = await ReviewModel.countDocuments({ product: product._id });

        return response(true, 200, "Product details retrieved", {
            product,
            variant: variantToDisplay,
            colors,
            sizes,
            reviewCount
        });

    } catch (error) {
        return catchError(error);
    }
}