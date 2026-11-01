import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '../auth/session-cookie.js'
import { CartValidationError, hashGuestCartToken } from '../cart/cart-service.js'
import { CheckoutConflictError, CheckoutNotFoundError, CheckoutValidationError } from './checkout-service.js'
import { CheckoutRepositoryConflictError, CheckoutRepositoryNotFoundError } from './checkout-repository.js'

const guestCookieName = (secure) => secure ? '__Host-narumugai-cart' : 'narumugai_guest_cart'

export function createCheckoutRouteHandlers({ sessionService, checkoutService, paymentService, secure, baseUrl }) {
  const sessionCookie = getSessionCookieName(secure)

  return {
    async checkout(request) {
      const sessionToken = request.cookies.get(sessionCookie)?.value
      let userId = null
      try { if (sessionToken) userId = (await sessionService.resolve(sessionToken))?.user?.id ?? null } catch {}
      const guestToken = request.cookies.get(guestCookieName(secure))?.value
      const guestTokenHash = !userId && guestToken && /^[A-Za-z0-9_-]{40,60}$/.test(guestToken) ? hashGuestCartToken(guestToken) : null
      const actor = userId ? { userId } : { guestTokenHash }
      let body
      try {
        const contentType = request.headers.get('content-type')?.split(';')[0].trim().toLowerCase()
        if (contentType !== 'application/json') throw new Error('content type')
        body = await request.json()
      } catch {
        return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'A JSON body is required.' } }, { status: 400 })
      }

      try {
        const result = await checkoutService.checkout(actor, body)
        const order = result.order
        const payment = order.payments?.[0]
        if (!payment) throw new Error('Checkout payment intent is unavailable.')
        const form = await paymentService.getCheckoutForm(order, payment)
        return NextResponse.json({
          data: { orderNumber: order.orderNumber, idempotent: result.idempotent, payment: form },
        }, { status: 201 })
      } catch (error) {
        if (error instanceof CheckoutValidationError || error instanceof CartValidationError) {
          return NextResponse.json({ error: { code: 'INVALID_CHECKOUT', message: error.message } }, { status: 400 })
        }
        if (error instanceof CheckoutNotFoundError || error instanceof CheckoutRepositoryNotFoundError) {
          return NextResponse.json({ error: { code: 'NOT_FOUND', message: error.message } }, { status: 404 })
        }
        if (error instanceof CheckoutConflictError || error instanceof CheckoutRepositoryConflictError || error?.code === 'P2034' || error?.code === 'P2002') {
          return NextResponse.json({ error: { code: 'CHECKOUT_CONFLICT', message: error.message || 'Checkout could not be completed.' } }, { status: 409 })
        }
        return NextResponse.json({ error: { code: 'CHECKOUT_UNAVAILABLE', message: 'Checkout is temporarily unavailable.' } }, { status: 503 })
      }
    },

    async paymentCallback(request) {
      let fields
      try { fields = Object.fromEntries(await request.formData()) } catch {
        return NextResponse.redirect(new URL('/payment-failure?error=invalid_callback', baseUrl))
      }
      try {
        const result = await paymentService.processCallback(fields)
        const path = result.status === 'processed'
          ? `/payment-success?orderNumber=${encodeURIComponent(result.orderNumber)}`
          : result.status === 'unknown'
            ? `/payment-failure?status=pending&orderNumber=${encodeURIComponent(result.orderNumber)}`
            : `/payment-failure?orderNumber=${encodeURIComponent(result.orderNumber)}`
        return NextResponse.redirect(new URL(path, baseUrl))
      } catch {
        return NextResponse.redirect(new URL('/payment-failure?error=payment_verification', baseUrl))
      }
    },
  }
}
