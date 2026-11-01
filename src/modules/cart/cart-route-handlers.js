import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '../auth/session-cookie.js'
import { CartItemUnavailableError, CartValidationError, createGuestCartToken, hashGuestCartToken } from './cart-service.js'
import { WishlistValidationError } from './wishlist-service.js'

const GUEST_COOKIE = 'narumugai_guest_cart'

export function createCartRouteHandlers({ sessionService, cartService, wishlistService, secure }) {
  const sessionCookie = getSessionCookieName(secure)
  const guestCookie = secure ? '__Host-narumugai-cart' : GUEST_COOKIE

  async function actorFor(request, createGuest = false) {
    const sessionToken = request.cookies.get(sessionCookie)?.value
    if (sessionToken) {
      const session = await sessionService.resolve(sessionToken)
      if (session?.user?.id) return { actor: { userId: session.user.id }, userId: session.user.id }
    }
    let guestToken = request.cookies.get(guestCookie)?.value
    let shouldSetCookie = false
    if (!guestToken && createGuest) {
      guestToken = createGuestCartToken()
      shouldSetCookie = true
    }
    if (!guestToken || !/^[A-Za-z0-9_-]{40,60}$/.test(guestToken)) return { actor: null }
    return { actor: { guestTokenHash: hashGuestCartToken(guestToken) }, guestToken, shouldSetCookie }
  }

  function attachGuestCookie(response, auth) {
    if (auth?.shouldSetCookie && auth.guestToken) {
      response.cookies.set(guestCookie, auth.guestToken, {
        httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 365,
      })
    }
    return response
  }

  async function readJson(request) {
    try { return { value: await request.json() } } catch { return { error: 'Request body must be valid JSON.' } }
  }

  function cartError(error) {
    if (error instanceof CartValidationError) return NextResponse.json({ error: { code: 'INVALID_CART_ITEM', message: error.message } }, { status: 400 })
    if (error instanceof CartItemUnavailableError) return NextResponse.json({ error: { code: 'ITEM_UNAVAILABLE', message: error.message } }, { status: 409 })
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Cart service is unavailable.' } }, { status: 503 })
  }

  async function requireUser(request) {
    const auth = await actorFor(request)
    if (!auth.userId) return { response: NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Sign in is required.' } }, { status: 401 }) }
    return auth
  }

  return {
    async getCart(request) {
      try {
        const auth = await actorFor(request, true)
        const result = await cartService.list(auth.actor)
        return attachGuestCookie(NextResponse.json({ data: result }), auth)
      } catch (error) { return cartError(error) }
    },
    async setCartItem(request, variantId) {
      try {
        const auth = await actorFor(request, true)
        const body = await readJson(request)
        if (body.error) return NextResponse.json({ error: { code: 'INVALID_JSON', message: body.error } }, { status: 400 })
        const result = await cartService.setItem(auth.actor, variantId, body.value?.quantity)
        return attachGuestCookie(NextResponse.json({ data: result }), auth)
      } catch (error) { return cartError(error) }
    },
    async removeCartItem(request, variantId) {
      try {
        const auth = await actorFor(request)
        if (!auth.actor) return NextResponse.json({ data: { removed: false } })
        await cartService.removeItem(auth.actor, variantId)
        return NextResponse.json({ data: { removed: true } })
      } catch (error) { return cartError(error) }
    },
    async mergeGuestCart(request) {
      try {
        const auth = await requireUser(request)
        if (auth.response) return auth.response
        const token = request.cookies.get(guestCookie)?.value
        if (!token || !/^[A-Za-z0-9_-]{40,60}$/.test(token)) return NextResponse.json({ data: { merged: 0, skipped: 0 } })
        const result = await cartService.mergeGuestCart(auth.userId, hashGuestCartToken(token))
        const response = NextResponse.json({ data: result })
        response.cookies.set(guestCookie, '', { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: 0 })
        return response
      } catch (error) { return cartError(error) }
    },
    async getWishlist(request) {
      try {
        const auth = await requireUser(request)
        if (auth.response) return auth.response
        return NextResponse.json({ data: await wishlistService.list(auth.userId) })
      } catch { return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Wishlist service is unavailable.' } }, { status: 503 }) }
    },
    async addWishlistItem(request, productId) {
      try {
        const auth = await requireUser(request)
        if (auth.response) return auth.response
        const added = await wishlistService.add(auth.userId, productId)
        if (!added) return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }, { status: 404 })
        return NextResponse.json({ data: { added: true } }, { status: 201 })
      } catch (error) {
        if (error instanceof WishlistValidationError) return NextResponse.json({ error: { code: 'INVALID_PRODUCT', message: error.message } }, { status: 400 })
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Wishlist service is unavailable.' } }, { status: 503 })
      }
    },
    async removeWishlistItem(request, productId) {
      try {
        const auth = await requireUser(request)
        if (auth.response) return auth.response
        await wishlistService.remove(auth.userId, productId)
        return NextResponse.json({ data: { removed: true } })
      } catch (error) {
        if (error instanceof WishlistValidationError) return NextResponse.json({ error: { code: 'INVALID_PRODUCT', message: error.message } }, { status: 400 })
        return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Wishlist service is unavailable.' } }, { status: 503 })
      }
    },
  }
}
