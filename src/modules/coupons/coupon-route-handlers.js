import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '../auth/session-cookie.js'
import { hashGuestCartToken } from '../cart/cart-service.js'
import { CouponUnavailableError, CouponValidationError } from './coupon-service.js'

export function createCouponRouteHandlers({ sessionService, couponService, secure }) {
  const sessionCookie = getSessionCookieName(secure)
  const guestCookie = secure ? '__Host-narumugai-cart' : 'narumugai_guest_cart'
  return {
    async validate(request) {
      let body
      try { body = await request.json() } catch { return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'A JSON body is required.' } }, { status: 400 }) }
      const token = request.cookies.get(sessionCookie)?.value
      let userId = null
      try { if (token) userId = (await sessionService.resolve(token))?.user?.id ?? null } catch {}
      const guestToken = request.cookies.get(guestCookie)?.value
      const actor = userId ? { userId } : guestToken && /^[A-Za-z0-9_-]{40,60}$/.test(guestToken) ? { guestTokenHash: hashGuestCartToken(guestToken) } : null
      if (!actor) return NextResponse.json({ error: { code: 'CART_NOT_FOUND', message: 'Your cart is unavailable.' } }, { status: 404 })
      try { return NextResponse.json({ data: await couponService.validate(actor, body?.code) }) }
      catch (error) {
        if (error instanceof CouponValidationError) return NextResponse.json({ error: { code: 'INVALID_COUPON', message: error.message } }, { status: 400 })
        if (error instanceof CouponUnavailableError) return NextResponse.json({ error: { code: 'COUPON_UNAVAILABLE', message: error.message } }, { status: 422 })
        return NextResponse.json({ error: { code: 'COUPON_SERVICE_UNAVAILABLE', message: 'Coupon validation is temporarily unavailable.' } }, { status: 503 })
      }
    },
  }
}
