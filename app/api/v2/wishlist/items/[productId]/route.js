import { getCartRouteHandlers } from '@/src/modules/cart/cart-runtime.js'

export async function PUT(request, { params }) {
  const { productId } = await params
  return (await getCartRouteHandlers()).addWishlistItem(request, productId)
}

export async function DELETE(request, { params }) {
  const { productId } = await params
  return (await getCartRouteHandlers()).removeWishlistItem(request, productId)
}
