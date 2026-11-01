import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '../auth/session-cookie.js'
import { AdminInputError } from './admin-service.js'

export function createAdminRouteHandlers({ sessionService, adminService, secure }) {
  const cookieName = getSessionCookieName(secure)
  async function admin(request) {
    const token = request.cookies.get(cookieName)?.value
    if (!token) return null
    const session = await sessionService.resolve(token)
    return session?.user?.role === 'ADMIN' ? session.user : null
  }
  async function body(request) {
    try { return { value: await request.json() } } catch { return { error: NextResponse.json({ error: { code: 'INVALID_JSON', message: 'A JSON body is required.' } }, { status: 400 }) } }
  }
  function handle(error) {
    if (error instanceof AdminInputError) return NextResponse.json({ error: { code: 'INVALID_INPUT', message: error.message } }, { status: 400 })
    if (error?.code === 'P2002') return NextResponse.json({ error: { code: 'ALREADY_EXISTS', message: 'A record with these details already exists.' } }, { status: 409 })
    if (error?.code === 'P2025') return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Record not found.' } }, { status: 404 })
    if (error?.message?.includes('not found')) return NextResponse.json({ error: { code: 'NOT_FOUND', message: error.message } }, { status: 404 })
    if (error?.message?.includes('cannot') || error?.message?.includes('Cannot')) return NextResponse.json({ error: { code: 'CONFLICT', message: error.message } }, { status: 409 })
    return NextResponse.json({ error: { code: 'ADMIN_SERVICE_UNAVAILABLE', message: 'Admin operation is temporarily unavailable.' } }, { status: 503 })
  }
  async function run(request, action) {
    try {
      const actor = await admin(request)
      if (!actor) return NextResponse.json({ error: { code: 'FORBIDDEN', message: 'Administrator access is required.' } }, { status: 403 })
      return await action(actor)
    } catch (error) { return handle(error) }
  }
  return {
    listCategories: (request) => run(request, async () => NextResponse.json({ data: await adminService.listCategories() })),
    createCategory: (request) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.createCategory(parsed.value, actor.id) }, { status: 201 })
    }),
    updateCategory: (request, id) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.updateCategory(id, parsed.value, actor.id) })
    }),
    listProducts: (request) => run(request, async () => {
      const page = Number(new URL(request.url).searchParams.get('page') || 1)
      if (!Number.isInteger(page) || page < 1 || page > 10000) throw new AdminInputError('Invalid page number.')
      return NextResponse.json({ data: await adminService.listProducts(page) })
    }),
    createProduct: (request) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.createProduct(parsed.value, actor.id) }, { status: 201 })
    }),
    updateProduct: (request, id) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.updateProduct(id, parsed.value, actor.id) })
    }),
    adjustInventory: (request, variantId) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.adjustInventory(variantId, parsed.value, actor.id) })
    }),
    listCoupons: (request) => run(request, async () => NextResponse.json({ data: await adminService.listCoupons() })),
    createCoupon: (request) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.createCoupon(parsed.value, actor.id) }, { status: 201 })
    }),
    updateCoupon: (request, id) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.updateCoupon(id, parsed.value, actor.id) })
    }),
    listOrders: (request) => run(request, async () => {
      const page = Number(new URL(request.url).searchParams.get('page') || 1)
      if (!Number.isInteger(page) || page < 1 || page > 10000) throw new AdminInputError('Invalid page number.')
      return NextResponse.json({ data: await adminService.listOrders(page) })
    }),
    listUsers: (request) => run(request, async () => {
      const page = Number(new URL(request.url).searchParams.get('page') || 1)
      if (!Number.isInteger(page) || page < 1 || page > 10000) throw new AdminInputError('Invalid page number.')
      return NextResponse.json({ data: await adminService.listUsers(page) })
    }),
    updateUser: (request, id) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      return NextResponse.json({ data: await adminService.updateUserStatus(id, parsed.value.status, actor.id) })
    }),
    transitionOrder: (request, id) => run(request, async (actor) => {
      const parsed = await body(request); if (parsed.error) return parsed.error
      const result = await adminService.transitionOrder(id, parsed.value.status, actor.id, parsed.value)
      return result ? NextResponse.json({ data: result }) : NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found.' } }, { status: 404 })
    }),
  }
}
