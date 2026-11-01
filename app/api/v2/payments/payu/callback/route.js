import { getCheckoutRouteHandlers } from '@/src/modules/checkout/checkout-runtime.js'

export async function POST(request) { return (await getCheckoutRouteHandlers()).paymentCallback(request) }
