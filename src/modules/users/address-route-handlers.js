import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '../auth/session-cookie.js'
import { AddressConflictError, AddressNotFoundError, AddressValidationError } from './address-service.js'

function errorResponse(error) {
  if (error instanceof AddressValidationError) return NextResponse.json({ message: error.message }, { status: 400 })
  if (error instanceof AddressNotFoundError) return NextResponse.json({ message: error.message }, { status: 404 })
  if (error instanceof AddressConflictError) return NextResponse.json({ message: error.message }, { status: 409 })
  return NextResponse.json({ message: 'Address service is unavailable.' }, { status: 503 })
}

async function readJson(request) {
  try {
    return { input: await request.json() }
  } catch {
    return { response: NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 }) }
  }
}

export function createAddressRouteHandlers({ sessionService, addressService, secure }) {
  if (typeof sessionService?.resolve !== 'function') throw new TypeError('Session service must implement resolve.')
  if (
    typeof addressService?.list !== 'function' || typeof addressService?.create !== 'function' ||
    typeof addressService?.update !== 'function' || typeof addressService?.remove !== 'function'
  ) throw new TypeError('Address service must implement list, create, update, and remove.')

  const cookieName = getSessionCookieName(secure)

  async function authenticated(request) {
    const token = request.cookies.get(cookieName)?.value
    if (!token) return { response: NextResponse.json({ message: 'Authentication is required.' }, { status: 401 }) }
    const session = await sessionService.resolve(token)
    const userId = session?.user?.id
    if (!userId) return { response: NextResponse.json({ message: 'Authentication is required.' }, { status: 401 }) }
    return { userId }
  }

  return {
    async GET(request) {
      try {
        const auth = await authenticated(request)
        if (auth.response) return auth.response
        return NextResponse.json({ addresses: await addressService.list(auth.userId) })
      } catch (error) { return errorResponse(error) }
    },
    async POST(request) {
      try {
        const auth = await authenticated(request)
        if (auth.response) return auth.response
        const body = await readJson(request)
        if (body.response) return body.response
        const address = await addressService.create(auth.userId, body.input)
        return NextResponse.json({ address }, { status: 201 })
      } catch (error) { return errorResponse(error) }
    },
    async PATCH(request, { addressId }) {
      try {
        const auth = await authenticated(request)
        if (auth.response) return auth.response
        const body = await readJson(request)
        if (body.response) return body.response
        const address = await addressService.update(auth.userId, addressId, body.input)
        return NextResponse.json({ address })
      } catch (error) { return errorResponse(error) }
    },
    async DELETE(request, { addressId }) {
      try {
        const auth = await authenticated(request)
        if (auth.response) return auth.response
        return NextResponse.json(await addressService.remove(auth.userId, addressId))
      } catch (error) { return errorResponse(error) }
    },
  }
}
