import { getCouponRouteHandlers } from '@/src/modules/coupons/coupon-runtime.js'

export async function POST(request) { return (await getCouponRouteHandlers()).validate(request) }
