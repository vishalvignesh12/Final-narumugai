import { getCartRouteHandlers } from '@/src/modules/cart/cart-runtime.js'

export async function GET(request) { return (await getCartRouteHandlers()).getWishlist(request) }
