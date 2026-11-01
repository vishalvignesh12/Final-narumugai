import { createSessionToken, hashSessionToken } from './session-token.js'

function requireDate(value, label) {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new TypeError(`${label} must be a valid Date.`)
  }
  return value
}

function requireClock(clock) {
  return requireDate(clock(), 'clock value')
}

export function createSessionService({ repository, tokenFactory = createSessionToken, clock = () => new Date() }) {
  if (
    typeof repository?.create !== 'function' ||
    typeof repository?.findByTokenHash !== 'function' ||
    typeof repository?.revokeByTokenHash !== 'function'
  ) {
    throw new TypeError('Session repository must implement create, findByTokenHash, and revokeByTokenHash.')
  }

  return {
    async create({ userId, expiresAt }) {
      if (typeof userId !== 'string' || userId.length === 0) {
        throw new TypeError('userId is required to create a session.')
      }
      const currentTime = requireClock(clock)
      const expiration = requireDate(expiresAt, 'expiresAt')
      if (expiration.getTime() <= currentTime.getTime()) {
        throw new RangeError('Session expiry must be in the future.')
      }

      const { token, tokenHash } = tokenFactory()
      const record = await repository.create({ userId, tokenHash, expiresAt: expiration })

      return { token, sessionId: record.id, expiresAt: record.expiresAt }
    },

    async resolve(token) {
      let tokenHash
      try {
        tokenHash = hashSessionToken(token)
      } catch {
        return null
      }

      const currentTime = requireClock(clock)
      const session = await repository.findByTokenHash(tokenHash)
      if (
        !session ||
        session.revokedAt != null ||
        !(session.expiresAt instanceof Date) ||
        !Number.isFinite(session.expiresAt.getTime()) ||
        session.expiresAt.getTime() <= currentTime.getTime() ||
        session.user?.status !== 'ACTIVE' ||
        session.user?.role !== 'CUSTOMER'
      ) {
        return null
      }

      return {
        sessionId: session.id,
        user: { id: session.user.id, role: session.user.role },
      }
    },

    async revoke(token) {
      let tokenHash
      try {
        tokenHash = hashSessionToken(token)
      } catch {
        return false
      }

      const revokedAt = requireClock(clock)
      const result = await repository.revokeByTokenHash(tokenHash, revokedAt)
      return result.count > 0
    },
  }
}
