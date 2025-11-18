import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model"; // Ensure this model is registered
import ProductVariantModel from "@/models/ProductVariant.model";

export async function GET(request, { params }) {
    try {
        await connectDB()
        const getParams = await params
        const orderid = getParams.orderid

        if (!orderid) {
            return response(false, 404, 'Order not found.')
        }

        const orderData = await OrderModel.findOne({ order_id: orderid })
            // --- FIX: Populate Product Details AND its Media ---
            .populate({
                path: 'products.productId',
                select: 'name slug media', // Select name, slug, AND media
                populate: { path: 'media', model: 'Media' } // Deep populate media for simple products
            })
            // --- FIX: Populate Variant Details AND its Media ---
            .populate({
                path: 'products.variantId',
                populate: { path: 'media', model: 'Media' }
            })
            .lean()

        if (!orderData) {
            return response(false, 404, 'Order not found.')
        }

        return response(true, 200, 'Order found.', orderData)

    } catch (error) {
        return catchError(error)
    }
}