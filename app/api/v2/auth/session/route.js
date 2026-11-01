import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '@/src/modules/auth/session-cookie.js'
import { createSessionRepository } from '@/src/modules/auth/session-repository.js'
import { clearSessionCookie, createSessionRouteHandlers } from '@/src/modules/auth/session-route-handlers.js'
import { createSessionService } from '@/src/modules/auth/session-service.js'

const secure = process.env.NODE_ENV === 'production'
const cookieName = getSessionCookieName(secure)
let handlersPromise

async function getHandlers() {
  handlersPromise ??= import('@/src/db/prisma.js').then(({ prisma }) => {
    const repository = createSessionRepository(prisma)
    const sessionService = createSessionService({ repository })
    return createSessionRouteHandlers({ sessionService, secure })
  })
  return handlersPromise
}

export async function GET(request) {
  if (!request.cookies.get(cookieName)?.value) {
    return NextResponse.json({ authenticated: false })
  }

  try {
    const { GET: getSession } = await getHandlers()
    return getSession(request)
  } catch {
    return NextResponse.json(
      { authenticated: false, message: 'Session service is unavailable.' },
      { status: 503 },
    )
  }
}

export async function DELETE(request) {
  if (!request.cookies.get(cookieName)?.value) {
    return clearSessionCookie(NextResponse.json({ success: true, revoked: false }), secure)
  }

  try {
    const { DELETE: deleteSession } = await getHandlers()
    return deleteSession(request)
  } catch {
    const response = NextResponse.json(
      { success: false, message: 'Session service is unavailable.' },
      { status: 503 },
    )
    return clearSessionCookie(response, secure)
  }
}
