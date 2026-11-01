import assert from 'node:assert/strict'
import test from 'node:test'
import { createSessionRouteHandlers } from './session-route-handlers.js'

function makeRequest(token, cookieName = 'narumugai_session') {
  return {
    cookies: {
      get(name) {
        assert.equal(name, cookieName)
        return token ? { value: token } : undefined
      },
    },
  }
}

test('returns anonymous session state when the cookie is absent or invalid', async () => {
  const handlers = createSessionRouteHandlers({
    sessionService: { resolve: async () => null, revoke: async () => false },
    secure: false,
  })

  const anonymous = await handlers.GET(makeRequest(null))
  assert.equal(anonymous.status, 200)
  assert.deepEqual(await anonymous.json(), { authenticated: false })

  const invalid = await handlers.GET(makeRequest('invalid'))
  assert.equal(invalid.status, 200)
  assert.deepEqual(await invalid.json(), { authenticated: false })
})

test('returns only the authenticated user identity and role', async () => {
  const handlers = createSessionRouteHandlers({
    sessionService: {
      resolve: async () => ({ sessionId: 'not-exposed', user: { id: 'user-id', role: 'CUSTOMER' } }),
      revoke: async () => false,
    },
    secure: false,
  })

  const response = await handlers.GET(makeRequest('opaque-token'))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), {
    authenticated: true,
    user: { id: 'user-id', role: 'CUSTOMER' },
  })
})

test('maps session persistence failures to a generic 503 response', async () => {
  const handlers = createSessionRouteHandlers({
    sessionService: {
      resolve: async () => { throw new Error('database credentials leaked') },
      revoke: async () => { throw new Error('database credentials leaked') },
    },
    secure: false,
  })

  const response = await handlers.GET(makeRequest('opaque-token'))
  assert.equal(response.status, 503)
  assert.deepEqual(await response.json(), {
    authenticated: false,
    message: 'Session service is unavailable.',
  })

  const logout = await handlers.DELETE(makeRequest('opaque-token'))
  assert.equal(logout.status, 503)
  assert.match(logout.headers.get('set-cookie'), /narumugai_session=;/)
})

test('revokes on logout and clears the HttpOnly host cookie', async () => {
  let revokedToken
  const handlers = createSessionRouteHandlers({
    sessionService: {
      resolve: async () => null,
      revoke: async (token) => { revokedToken = token; return true },
    },
    secure: true,
  })

  const response = await handlers.DELETE(makeRequest('session-token', '__Host-narumugai-session'))
  assert.equal(revokedToken, 'session-token')
  assert.deepEqual(await response.json(), { success: true, revoked: true })
  assert.match(response.headers.get('set-cookie'), /__Host-narumugai-session=;/)
  assert.match(response.headers.get('set-cookie'), /HttpOnly/)
  assert.match(response.headers.get('set-cookie'), /Secure/)
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/)
})
