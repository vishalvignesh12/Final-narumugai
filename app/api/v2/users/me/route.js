import { getSessionCookieName } from '@/src/modules/auth/session-cookie.js'
import { createSessionRepository } from '@/src/modules/auth/session-repository.js'
import { createSessionService } from '@/src/modules/auth/session-service.js'
import { createProfileRepository } from '@/src/modules/users/profile-repository.js'
import { createProfileRouteHandlers } from '@/src/modules/users/profile-route-handlers.js'
import { createProfileService } from '@/src/modules/users/profile-service.js'

const secure = process.env.NODE_ENV === 'production'
const cookieName = getSessionCookieName(secure)
let handlersPromise

async function getHandlers() {
  handlersPromise ??= import('@/src/db/prisma.js').then(({ prisma }) => {
    const sessionService = createSessionService({ repository: createSessionRepository(prisma) })
    const profileService = createProfileService({ repository: createProfileRepository(prisma) })
    return createProfileRouteHandlers({ sessionService, profileService, secure })
  })
  return handlersPromise
}

async function invoke(request, method) {
  if (!request.cookies.get(cookieName)?.value) {
    return Response.json({ message: 'Authentication is required.' }, { status: 401 })
  }

  try {
    const handlers = await getHandlers()
    return handlers[method](request)
  } catch {
    return Response.json({ message: 'Profile service is unavailable.' }, { status: 503 })
  }
}

export function GET(request) {
  return invoke(request, 'GET')
}

export function PATCH(request) {
  return invoke(request, 'PATCH')
}
