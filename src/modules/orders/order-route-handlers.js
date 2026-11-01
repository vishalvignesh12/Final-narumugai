import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '../auth/session-cookie.js'
import { hashGuestCartToken } from '../cart/cart-service.js'
import { OrderInputError } from './order-service.js'

export function createOrderRouteHandlers({ sessionService, orderService, secure }) {
  const sessionCookie = getSessionCookieName(secure)
  const guestCookie = secure ? '__Host-narumugai-cart' : 'narumugai_guest_cart'
  async function actor(request) {
    const token = request.cookies.get(sessionCookie)?.value
    if (token) {
      const session = await sessionService.resolve(token)
      if (session?.user?.id) return { userId: session.user.id }
    }
    const guest = request.cookies.get(guestCookie)?.value
    if (guest && /^[A-Za-z0-9_-]{40,60}$/.test(guest)) return { guestTokenHash: hashGuestCartToken(guest) }
    return null
  }
  function authRequired() { return NextResponse.json({ error: { code: 'UNAUTHENTICATED', message: 'Order access requires a valid session or guest cart token.' } }, { status: 401 }) }
  function handle(error) {
    if (error instanceof OrderInputError) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: error.message } }, { status: 400 })
    if (error?.message?.includes('current state') || error?.message?.includes('resolved')) return NextResponse.json({ error: { code: 'ORDER_CONFLICT', message: error.message } }, { status: 409 })
    return NextResponse.json({ error: { code: 'ORDER_SERVICE_UNAVAILABLE', message: 'Order service is temporarily unavailable.' } }, { status: 503 })
  }
  return {
    async list(request) {
      try {
        const owner = await actor(request)
        if (!owner) return authRequired()
        const rawPage = new URL(request.url).searchParams.get('page')
        const page = rawPage ? Number(rawPage) : 1
        return NextResponse.json({ data: await orderService.list(owner, page) })
      } catch (error) { return handle(error) }
    },
    async get(request, orderNumber) {
      try {
        const owner = await actor(request)
        if (!owner) return authRequired()
        const order = await orderService.get(owner, orderNumber)
        return order ? NextResponse.json({ data: order }) : NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found.' } }, { status: 404 })
      } catch (error) { return handle(error) }
    },
    async cancel(request, orderNumber) {
      try {
        const owner = await actor(request)
        if (!owner) return authRequired()
        let body
        try { body = await request.json() } catch { return NextResponse.json({ error: { code: 'INVALID_JSON', message: 'A JSON body is required.' } }, { status: 400 }) }
        const result = await orderService.cancel(owner, orderNumber, body?.reason)
        return result ? NextResponse.json({ data: result }) : NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found.' } }, { status: 404 })
      } catch (error) { return handle(error) }
    },
  }
}
