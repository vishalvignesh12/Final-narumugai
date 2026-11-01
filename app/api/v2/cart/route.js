import { getCartRouteHandlers } from '@/src/modules/cart/cart-runtime.js'

export async function GET(request) { return (await getCartRouteHandlers()).getCart(request) }
export async function POST(request) { return (await getCartRouteHandlers()).mergeGuestCart(request) }
