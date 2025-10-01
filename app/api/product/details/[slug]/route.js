import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import ReviewModel from "@/models/Review.model";

export async function GET(request, { params }) {
    try {
        await connectDB();

        const { slug } = params;
        const searchParams = request.nextUrl.searchParams;
        const size = searchParams.get("size");
        const color = searchParams.get("color");

        if (!slug) {
            return response(false, 404, "Product not found.");
        }

        // Get product
        const getProduct = await ProductModel.findOne({ slug, deletedAt: null })
            .populate("media", "secure_url")
            .lean();

        if (!getProduct) {
            return response(false, 404, "Product not found.");
        }

        // Get product variant
        const variantFilter = { product: getProduct._id };
        if (size) variantFilter.size = size;
        if (color) variantFilter.color = color;

        let variant = await ProductVariantModel.findOne(variantFilter)
            .populate("media", "secure_url")
            .lean();

        if (!variant) {
            variant = await ProductVariantModel.findOne({ product: getProduct._id })
                .populate("media", "secure_url")
                .lean();
        }

        if (!variant) {
            variant = {
                _id: null,
                product: getProduct._id,
                color: "Default",
                size: "Default",
                mrp: getProduct.mrp,
                sellingPrice: getProduct.sellingPrice,
                discountPercentage: getProduct.discountPercentage,
                quantity: getProduct.quantity || 0,
                media: getProduct.media || []
            };
        }

        // Get colors & sizes
        const colors = await ProductVariantModel.distinct("color", { product: getProduct._id });
        const sizeAgg = await ProductVariantModel.aggregate([
            { $match: { product: getProduct._id } },
            { $sort: { _id: 1 } },
            { $group: { _id: "$size", first: { $first: "$_id" } } },
            { $sort: { first: 1 } },
            { $project: { _id: 0, size: "$_id" } }
        ]);

        const sizes = sizeAgg.length > 0 ? sizeAgg.map((s) => s.size) : ["Default"];

        // Get reviews
        const reviewCount = await ReviewModel.countDocuments({ product: getProduct._id });

        return response(true, 200, "Product data found.", {
            product: getProduct,
            variant,
            colors: colors.length > 0 ? colors : ["Default"],
            sizes,
            reviewCount
        });
    } catch (error) {
        return catchError(error);
    }
}
