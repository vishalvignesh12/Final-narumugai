import assert from 'node:assert/strict'
import test from 'node:test'
import { createAddressRouteHandlers } from './address-route-handlers.js'
import { AddressNotFoundError } from './address-service.js'

const userId = '6ac2eb78-59db-440e-93f9-15e599c7fdf2'
const addressId = '95f46ced-8f01-4516-99c7-21e27bd9a2b3'
const address = { id: addressId, userId, recipientName: 'Customer', isDefault: false }

function request(token, body, cookieName = 'narumugai_session') {
  return {
    cookies: { get(name) { assert.equal(name, cookieName); return token ? { value: token } : undefined } },
    async json() { if (body instanceof Error) throw body; return body },
  }
}

function createHandlers(overrides = {}) {
  const calls = []
  const handlers = createAddressRouteHandlers({
    sessionService: { async resolve(token) { return token === 'valid' ? { user: { id: userId } } : null } },
    addressService: {
      async list(id) { calls.push(['list', id]); return [address] },
      async create(id, input) { calls.push(['create', id, input]); return address },
      async update(id, target, input) { calls.push(['update', id, target, input]); return address },
      async remove(id, target) { calls.push(['remove', id, target]); return { success: true } },
      ...overrides,
    },
    secure: false,
  })
  return { handlers, calls }
}

test('requires authentication and rejects invalid sessions', async () => {
  const { handlers } = createHandlers()
  assert.equal((await handlers.GET(request(null))).status, 401)
  assert.equal((await handlers.GET(request('invalid'))).status, 401)
})

test('uses the session owner for list, create, update, and delete', async () => {
  const { handlers, calls } = createHandlers()
  assert.equal((await handlers.GET(request('valid'))).status, 200)
  assert.equal((await handlers.POST(request('valid', { recipientName: 'Customer' }))).status, 201)
  assert.equal((await handlers.PATCH(request('valid', { city: 'Chennai' }), { addressId })).status, 200)
  assert.equal((await handlers.DELETE(request('valid'), { addressId })).status, 200)
  assert.deepEqual(calls.map((call) => call.slice(0, 2)), [
    ['list', userId], ['create', userId], ['update', userId], ['remove', userId],
  ])
})

test('rejects malformed JSON and maps missing addresses without leaking details', async () => {
  const malformed = createHandlers()
  assert.equal((await malformed.handlers.POST(request('valid', new Error('bad json')))).status, 400)

  const missing = createHandlers({ async update() { throw new AddressNotFoundError() } })
  const response = await missing.handlers.PATCH(request('valid', { city: 'Chennai' }), { addressId })
  assert.equal(response.status, 404)
})
