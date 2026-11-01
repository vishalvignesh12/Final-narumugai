import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import MediaModel from "@/models/Media.model";
import OrderModel from "@/models/Order.model";
import ProductModel from "@/models/Product.model"; // Ensure this model is registered
import ProductVariantModel from "@/models/ProductVariant.model";
import { isAuthenticated } from "@/lib/authentication";
import { verifyOrderAccessToken } from "@/lib/orderAccess";

export async function GET(request, { params }) {
    try {
        await connectDB()
        const getParams = await params
        const orderid = getParams.orderid
        const accessToken = request.nextUrl.searchParams.get('access_token')

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
            .lean()

        if (!orderData) {
            return response(false, 404, 'Order not found.')
        }

        const variantIds = orderData.products
            .filter((item) => item.variantId && /^[a-f\d]{24}$/i.test(String(item.variantId)))
            .map((item) => String(item.variantId));
        if (variantIds.length) {
            const variants = await ProductVariantModel.find({ _id: { $in: variantIds } })
                .populate({ path: 'media', model: MediaModel, select: 'secure_url' })
                .lean();
            const variantsById = new Map(variants.map((variant) => [String(variant._id), variant]));
            orderData.products = orderData.products.map((item) => ({
                ...item,
                variantId: variantsById.get(String(item.variantId)) || null,
            }));
        }

        const auth = await isAuthenticated('user')
        const isOwner = auth.isAuth && String(orderData.user) === String(auth.userId)
        const hasGuestAccess = accessToken && await verifyOrderAccessToken(accessToken, orderData.order_id)
        if (!isOwner && !hasGuestAccess) {
            return response(false, 403, 'Order access is not authorized.')
        }

        const result = response(true, 200, 'Order found.', orderData)
        result.headers.set('Cache-Control', 'private, no-store')
        return result

    } catch (error) {
        return catchError(error)
    }
}
