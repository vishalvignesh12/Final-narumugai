import assert from 'node:assert/strict'
import test from 'node:test'
import { hashSessionToken } from './session-token.js'
import { createSessionRepository } from './session-repository.js'
import { createSessionService } from './session-service.js'

const now = new Date('2026-01-01T00:00:00.000Z')
const expiry = new Date('2026-01-02T00:00:00.000Z')

function makeRepository(overrides = {}) {
  const stored = { session: null }
  return {
    stored,
    repository: {
      async create(data) {
        stored.session = { id: 'session-id', ...data, revokedAt: null, user: { id: data.userId, role: 'CUSTOMER', status: 'ACTIVE' } }
        return { id: stored.session.id, expiresAt: stored.session.expiresAt }
      },
      async findByTokenHash(tokenHash) {
        if (stored.session?.tokenHash !== tokenHash) return null
        return stored.session
      },
      async revokeByTokenHash(tokenHash, revokedAt) {
        if (!stored.session || stored.session.tokenHash !== tokenHash || stored.session.revokedAt) return { count: 0 }
        stored.session.revokedAt = revokedAt
        return { count: 1 }
      },
      ...overrides,
    },
  }
}

test('creates database session rows with only a token hash', async () => {
  const { repository, stored } = makeRepository()
  const service = createSessionService({ repository, clock: () => now })

  const result = await service.create({ userId: 'user-id', expiresAt: expiry })

  assert.match(result.token, /^[A-Za-z0-9_-]{43}$/)
  assert.equal(result.sessionId, 'session-id')
  assert.equal(stored.session.tokenHash, hashSessionToken(result.token))
  assert.equal(Object.hasOwn(stored.session, 'token'), false)
  assert.equal(stored.session.expiresAt, expiry)
})

test('resolves only active, unexpired, unrevoked user sessions', async () => {
  const { repository, stored } = makeRepository()
  const service = createSessionService({ repository, clock: () => now })
  const created = await service.create({ userId: 'user-id', expiresAt: expiry })

  assert.deepEqual(await service.resolve(created.token), {
    sessionId: 'session-id',
    user: { id: 'user-id', role: 'CUSTOMER' },
  })

  repository.findByTokenHash = async () => ({ ...stored.session, user: { id: 'user-id', role: 'ADMIN', status: 'ACTIVE' } })
  assert.equal(await service.resolve(created.token), null)
  repository.findByTokenHash = async () => ({ ...stored.session, user: { id: 'user-id', role: 'ADMIN', status: 'SUSPENDED' } })
  assert.equal(await service.resolve(created.token), null)
  repository.findByTokenHash = async () => ({ ...stored.session, expiresAt: now })
  assert.equal(await service.resolve(created.token), null)
  repository.findByTokenHash = async () => ({ ...stored.session, revokedAt: now })
  assert.equal(await service.resolve(created.token), null)
  assert.equal(await service.resolve('invalid'), null)
})

test('revokes a session idempotently without accepting malformed tokens', async () => {
  const { repository } = makeRepository()
  const service = createSessionService({ repository, clock: () => now })
  const created = await service.create({ userId: 'user-id', expiresAt: expiry })

  assert.equal(await service.revoke(created.token), true)
  assert.equal(await service.revoke(created.token), false)
  assert.equal(await service.resolve(created.token), null)
  assert.equal(await service.revoke('invalid'), false)
})

test('rejects missing user IDs and nonfuture session expiry values', async () => {
  const { repository } = makeRepository()
  const service = createSessionService({ repository, clock: () => now })

  await assert.rejects(service.create({ userId: '', expiresAt: expiry }), /userId is required/)
  await assert.rejects(service.create({ userId: 'user-id', expiresAt: now }), /must be in the future/)
  await assert.rejects(service.create({ userId: 'user-id', expiresAt: 'tomorrow' }), /must be a valid Date/)
})

test('Prisma repository selects minimal session and user fields and revokes with updateMany', async () => {
  const calls = []
  const prisma = {
    session: {
      create: async (query) => (calls.push(['create', query]), { id: 'session-id', expiresAt: expiry }),
      findUnique: async (query) => (calls.push(['find', query]), null),
      updateMany: async (query) => (calls.push(['revoke', query]), { count: 1 }),
    },
  }
  const repository = createSessionRepository(prisma)

  await repository.create({ userId: 'user-id', tokenHash: 'a'.repeat(64), expiresAt: expiry })
  await repository.findByTokenHash('a'.repeat(64))
  await repository.revokeByTokenHash('a'.repeat(64), now)

  assert.equal(calls[0][1].data.tokenHash, 'a'.repeat(64))
  assert.deepEqual(calls[1][1].select.user.select, { id: true, role: true, status: true })
  assert.deepEqual(calls[2][1].where, { tokenHash: 'a'.repeat(64), revokedAt: null })
})
