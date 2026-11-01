import { NextResponse } from 'next/server.js'
import { getSessionCookieName } from '../auth/session-cookie.js'
import {
  ProfileEmailConflictError,
  ProfileNotFoundError,
  ProfileValidationError,
} from './profile-service.js'

function errorResponse(error) {
  if (error instanceof ProfileValidationError) {
    return NextResponse.json({ message: error.message }, { status: 400 })
  }
  if (error instanceof ProfileNotFoundError) {
    return NextResponse.json({ message: error.message }, { status: 404 })
  }
  if (error instanceof ProfileEmailConflictError) {
    return NextResponse.json({ message: error.message }, { status: 409 })
  }
  return NextResponse.json({ message: 'Profile service is unavailable.' }, { status: 503 })
}

export function createProfileRouteHandlers({ sessionService, profileService, secure }) {
  if (typeof sessionService?.resolve !== 'function') {
    throw new TypeError('Session service must implement resolve.')
  }
  if (typeof profileService?.get !== 'function' || typeof profileService?.update !== 'function') {
    throw new TypeError('Profile service must implement get and update.')
  }

  const cookieName = getSessionCookieName(secure)

  async function getUserId(request) {
    const token = request.cookies.get(cookieName)?.value
    if (!token) return null
    const session = await sessionService.resolve(token)
    return session?.user?.id ?? null
  }

  return {
    async GET(request) {
      try {
        const userId = await getUserId(request)
        if (!userId) return NextResponse.json({ message: 'Authentication is required.' }, { status: 401 })
        const profile = await profileService.get(userId)
        return NextResponse.json({ user: profile })
      } catch (error) {
        return errorResponse(error)
      }
    },

    async PATCH(request) {
      try {
        const userId = await getUserId(request)
        if (!userId) return NextResponse.json({ message: 'Authentication is required.' }, { status: 401 })

        let input
        try {
          input = await request.json()
        } catch {
          return NextResponse.json({ message: 'Request body must be valid JSON.' }, { status: 400 })
        }

        const profile = await profileService.update(userId, input)
        return NextResponse.json({ user: profile })
      } catch (error) {
        return errorResponse(error)
      }
    },
  }
}
