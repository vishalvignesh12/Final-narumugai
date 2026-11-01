import { connectDB } from "@/lib/databaseConnection";
import { catchError, response } from "@/lib/helperFunction";
import { zSchema } from "@/lib/zodSchema";
import CouponModel from "@/models/Coupon.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { computeCouponState, couponCodeFilter } from "@/lib/coupons";
import { isAuthenticated } from "@/lib/authentication";

export async function POST(request) {
    try {
        await connectDB()
        const payload = await request.json()
        const auth = await isAuthenticated('user')
        if (!auth.isAuth) return response(false, 401, 'Unauthorized.')
        const validate = zSchema.pick({ code: true }).safeParse(payload)
        if (!validate.success) {
            return response(false, 400, 'Missing or invalid data.', validate.error)
        }

        const { code } = validate.data
        const products = Array.isArray(payload.products) ? payload.products : []
        if (products.length === 0) return response(false, 400, 'Cart products are required.')

        let subtotal = 0
        for (const item of products) {
            if (item.variantId && item.variantId !== 'null' && !String(item.variantId).startsWith('fallback-')) {
                const variant = await ProductVariantModel.findOne({ _id: item.variantId, deletedAt: null }).select('product sellingPrice').lean()
                if (!variant || String(variant.product) !== String(item.productId)) return response(false, 400, 'Invalid cart item.')
                subtotal += Number(variant.sellingPrice) * Number(item.qty || 1)
            } else {
                const product = await ProductModel.findOne({ _id: item.productId, deletedAt: null }).select('sellingPrice').lean()
                if (!product) return response(false, 400, 'Invalid cart item.')
                subtotal += Number(product.sellingPrice) * Number(item.qty || 1)
            }
        }

        const couponData = await CouponModel.findOne({ code: couponCodeFilter(code), deletedAt: null }).lean()
        if (!couponData) {
            return response(false, 400, 'Invalid or expired coupon code.')
        }

        const state = computeCouponState({ coupon: couponData, subtotal })
        if (!state.valid) {
            const messages = {
                expired: 'Coupon code expired.',
                deleted: 'Invalid or expired coupon code.',
                min_purchase: 'In-sufficient shopping amount.',
                invalid: 'Invalid coupon discount.'
            }
            return response(false, 400, messages[state.reason] || 'Invalid or expired coupon code.')
        }
        return response(true, 200, 'Coupon applied successfully.', {
            discountPercentage: couponData.discountPercentage,
            discountAmount: state.discountAmount,
            subtotal
        })


    } catch (error) {
        return catchError(error)
    }
}