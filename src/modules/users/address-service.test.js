import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AddressConflictError,
  AddressNotFoundError,
  AddressValidationError,
  createAddressService,
} from './address-service.js'

const userId = '6ac2eb78-59db-440e-93f9-15e599c7fdf2'
const addressId = '95f46ced-8f01-4516-99c7-21e27bd9a2b3'
const input = {
  recipientName: '  Narumugai Customer ',
  phone: '+919876543210',
  line1: ' 12 Test Road ',
  city: ' Chennai ',
  state: ' Tamil Nadu ',
  postalCode: '600001',
}

function makeService(overrides = {}) {
  return createAddressService({ repository: {
    async listByUserId() { return [] },
    async createForUser(id, data) { return { id, ...data } },
    async updateForUser() { return { id: addressId } },
    async deleteForUser() { return true },
    ...overrides,
  } })
}

test('normalizes address text and leaves default selection explicit', async () => {
  const result = await makeService().create(userId, input)
  assert.equal(result.recipientName, 'Narumugai Customer')
  assert.equal(result.line1, '12 Test Road')
  assert.equal(result.city, 'Chennai')
  assert.equal(result.isDefault, false)
})

test('validates India-only phone and postal code rules and rejects owner/country fields', async () => {
  const service = makeService()
  for (const invalid of [
    { ...input, phone: '9876543210' },
    { ...input, phone: '+91987654321' },
    { ...input, postalCode: '060001' },
    { ...input, countryCode: 'US' },
    { ...input, userId },
  ]) await assert.rejects(service.create(userId, invalid), AddressValidationError)
})

test('requires a valid update and address ID', async () => {
  const service = makeService()
  await assert.rejects(service.update(userId, addressId, {}), AddressValidationError)
  await assert.rejects(service.update(userId, 'not-a-uuid', { city: 'Chennai' }), AddressValidationError)
  await assert.rejects(service.update(userId, addressId, { postalCode: '123' }), AddressValidationError)
})

test('scopes every operation to the authenticated user', async () => {
  const calls = []
  const service = makeService({
    async listByUserId(id) { calls.push(['list', id]); return [] },
    async createForUser(id, data) { calls.push(['create', id, data]); return { id: addressId } },
    async updateForUser(id, target, data) { calls.push(['update', id, target, data]); return { id: target } },
    async deleteForUser(id, target) { calls.push(['delete', id, target]); return true },
  })
  await service.list(userId)
  await service.create(userId, input)
  await service.update(userId, addressId, { city: 'Madurai' })
  await service.remove(userId, addressId)
  assert.deepEqual(calls.map(([operation, id]) => [operation, id]), [
    ['list', userId], ['create', userId], ['update', userId], ['delete', userId],
  ])
})

test('maps missing rows and concurrent default conflicts to domain errors', async () => {
  await assert.rejects(makeService({ async updateForUser() { return null } }).update(userId, addressId, { city: 'Chennai' }), AddressNotFoundError)
  await assert.rejects(makeService({ async deleteForUser() { return false } }).remove(userId, addressId), AddressNotFoundError)
  await assert.rejects(
    makeService({ async updateForUser() { throw { code: 'P2034' } } }).update(userId, addressId, { isDefault: true }),
    AddressConflictError,
  )
  await assert.rejects(
    makeService({ async createForUser() { throw { code: 'P2002' } } }).create(userId, { ...input, isDefault: true }),
    AddressConflictError,
  )
})
