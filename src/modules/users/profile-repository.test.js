import assert from 'node:assert/strict'
import test from 'node:test'
import { createProfileRepository } from './profile-repository.js'

test('selects only public self-profile fields for reads and updates', async () => {
  const calls = []
  const prisma = {
    user: {
      async findUnique(args) { calls.push(['findUnique', args]); return { id: 'user-id' } },
      async update(args) { calls.push(['update', args]); return { id: 'user-id' } },
    },
  }
  const repository = createProfileRepository(prisma)

  await repository.findById('user-id')
  await repository.updateById('user-id', { displayName: 'Name' })

  assert.deepEqual(calls[0][1], {
    where: { id: 'user-id' },
    select: {
      id: true,
      phone: true,
      email: true,
      displayName: true,
      phoneVerifiedAt: true,
      createdAt: true,
    },
  })
  assert.deepEqual(calls[1][1].where, { id: 'user-id' })
  assert.deepEqual(calls[1][1].data, { displayName: 'Name' })
  assert.equal('role' in calls[1][1].select, false)
})

test('maps Prisma missing-row updates to null', async () => {
  const repository = createProfileRepository({
    user: {
      async findUnique() { return null },
      async update() { throw Object.assign(new Error('missing'), { code: 'P2025' }) },
    },
  })
  assert.equal(await repository.findById('missing'), null)
  assert.equal(await repository.updateById('missing', { displayName: 'Name' }), null)
})
