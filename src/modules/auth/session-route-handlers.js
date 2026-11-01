import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from './session-cookie.js'

export function clearSessionCookie(response, secure) {
  const name = getSessionCookieName(secure)
  response.cookies.set(name, '', {
    httpOnly: true,
    secure,
    sameSite: 'lax',
    path: '/',
    expires: new Date(0),
    maxAge: 0,
  })
  return response
}

export function createSessionRouteHandlers({ sessionService, secure }) {
  if (typeof sessionService?.resolve !== 'function' || typeof sessionService?.revoke !== 'function') {
    throw new TypeError('Session service must implement resolve and revoke.')
  }

  const cookieName = getSessionCookieName(secure)

  return {
    async GET(request) {
      const token = request.cookies.get(cookieName)?.value
      if (!token) {
        return NextResponse.json({ authenticated: false })
      }

      try {
        const session = await sessionService.resolve(token)
        if (!session) return NextResponse.json({ authenticated: false })
        return NextResponse.json({ authenticated: true, user: session.user })
      } catch {
        return NextResponse.json(
          { authenticated: false, message: 'Session service is unavailable.' },
          { status: 503 },
        )
      }
    },

    async DELETE(request) {
      const token = request.cookies.get(cookieName)?.value
      let revoked = false

      try {
        if (token) revoked = await sessionService.revoke(token)
      } catch {
        const response = NextResponse.json(
          { success: false, message: 'Session service is unavailable.' },
          { status: 503 },
        )
        return clearSessionCookie(response, secure)
      }

      const response = NextResponse.json({ success: true, revoked })
      return clearSessionCookie(response, secure)
    },
  }
}
