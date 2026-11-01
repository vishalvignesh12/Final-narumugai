import { getSessionCookieName } from '@/src/modules/auth/session-cookie.js'
import { getAddressRouteHandlers } from '@/src/modules/users/address-runtime.js'

const cookieName = getSessionCookieName(process.env.NODE_ENV === 'production')

async function invoke(request, method, context) {
  if (!request.cookies.get(cookieName)?.value) {
    return Response.json({ message: 'Authentication is required.' }, { status: 401 })
  }
  try {
    const handlers = await getAddressRouteHandlers()
    return handlers[method](request, context)
  } catch {
    return Response.json({ message: 'Address service is unavailable.' }, { status: 503 })
  }
}

export async function PATCH(request, context) {
  const { addressId } = await context.params
  return invoke(request, 'PATCH', { addressId })
}

export async function DELETE(request, context) {
  const { addressId } = await context.params
  return invoke(request, 'DELETE', { addressId })
}
