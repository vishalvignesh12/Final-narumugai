import assert from 'node:assert/strict'
import test from 'node:test'
import { createProfileRouteHandlers } from './profile-route-handlers.js'
import { ProfileEmailConflictError, ProfileNotFoundError } from './profile-service.js'

const profile = { id: 'user-id', phone: '+14155552671', email: null, displayName: 'Customer' }

function request(token, body, cookieName = 'narumugai_session') {
  return {
    cookies: { get(name) { assert.equal(name, cookieName); return token ? { value: token } : undefined } },
    async json() { if (body instanceof Error) throw body; return body },
  }
}

function handlers({ resolve = async (token) => token === 'valid' ? { user: { id: 'user-id' } } : null, get = async () => profile, update = async () => profile } = {}) {
  return createProfileRouteHandlers({
    sessionService: { resolve },
    profileService: { get, update },
    secure: false,
  })
}

test('requires an authenticated session and does not call the profile service anonymously', async () => {
  let called = false
  const routes = handlers({ get: async () => { called = true; return profile } })
  const response = await routes.GET(request(null))
  assert.equal(response.status, 401)
  assert.equal(called, false)
})

test('reads and updates only the identity resolved from the session cookie', async () => {
  let queriedId
  let updated
  const routes = handlers({
    get: async (id) => { queriedId = id; return profile },
    update: async (id, input) => { updated = { id, input }; return profile },
  })

  const getResponse = await routes.GET(request('valid'))
  assert.equal(getResponse.status, 200)
  assert.deepEqual(await getResponse.json(), { user: profile })
  assert.equal(queriedId, 'user-id')

  const patchResponse = await routes.PATCH(request('valid', { displayName: 'Customer' }))
  assert.equal(patchResponse.status, 200)
  assert.deepEqual(updated, { id: 'user-id', input: { displayName: 'Customer' } })
})

test('rejects malformed JSON and maps service errors to stable status codes', async () => {
  const routes = handlers({ update: async () => { throw new ProfileEmailConflictError() } })
  const malformed = await routes.PATCH(request('valid', new Error('bad json')))
  assert.equal(malformed.status, 400)

  const duplicate = await routes.PATCH(request('valid', { email: 'x@example.com' }))
  assert.equal(duplicate.status, 409)

  const missing = handlers({ get: async () => { throw new ProfileNotFoundError() } })
  const missingResponse = await missing.GET(request('valid'))
  assert.equal(missingResponse.status, 404)

  const failing = handlers({ get: async () => { throw new Error('internal database detail') } })
  const failureResponse = await failing.GET(request('valid'))
  assert.equal(failureResponse.status, 503)
  assert.doesNotMatch(await failureResponse.text(), /internal database detail/)
})
