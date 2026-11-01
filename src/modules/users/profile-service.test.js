import assert from 'node:assert/strict'
import test from 'node:test'
import {
  createProfileService,
  ProfileEmailConflictError,
  ProfileNotFoundError,
  ProfileValidationError,
} from './profile-service.js'

const profile = {
  id: 'user-id',
  phone: '+14155552671',
  email: null,
  displayName: 'Narumugai Customer',
  phoneVerifiedAt: new Date('2026-01-01T00:00:00.000Z'),
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
}

test('returns the profile for the authenticated user id', async () => {
  const service = createProfileService({ repository: { findById: async (id) => id === profile.id ? profile : null, updateById() {} } })
  assert.deepEqual(await service.get(profile.id), profile)
  await assert.rejects(service.get('another-user'), ProfileNotFoundError)
})

test('validates, normalizes, and applies only supplied profile fields', async () => {
  let update
  const service = createProfileService({
    repository: {
      findById() {},
      async updateById(id, data) { update = { id, data }; return { ...profile, ...data } },
    },
  })

  await service.update(profile.id, { displayName: '  New Name ', email: ' PERSON@EXAMPLE.COM ' })
  assert.deepEqual(update, {
    id: profile.id,
    data: { displayName: 'New Name', email: 'person@example.com' },
  })
  await service.update(profile.id, { email: null })
  assert.deepEqual(update.data, { email: null })
})

test('rejects empty patches, unknown fields, invalid emails, and blank names', async () => {
  const service = createProfileService({ repository: { findById() {}, updateById() {} } })
  for (const input of [{}, { role: 'ADMIN' }, { email: 'invalid' }, { displayName: '   ' }]) {
    await assert.rejects(service.update(profile.id, input), ProfileValidationError)
  }
})

test('maps unique email conflicts and missing update rows to domain errors', async () => {
  const duplicateEmailService = createProfileService({
    repository: {
      findById() {},
      async updateById() { throw { code: 'P2002', meta: { target: ['email'] } } },
    },
  })
  await assert.rejects(duplicateEmailService.update(profile.id, { email: 'person@example.com' }), ProfileEmailConflictError)

  const missingService = createProfileService({ repository: { findById() {}, async updateById() { return null } } })
  await assert.rejects(missingService.update(profile.id, { displayName: 'New Name' }), ProfileNotFoundError)
})
