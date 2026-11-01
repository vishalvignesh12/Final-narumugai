import { getCartRouteHandlers } from '@/src/modules/cart/cart-runtime.js'

export async function PUT(request, { params }) {
  const { variantId } = await params
  return (await getCartRouteHandlers()).setCartItem(request, variantId)
}

export async function DELETE(request, { params }) {
  const { variantId } = await params
  return (await getCartRouteHandlers()).removeCartItem(request, variantId)
}
