import assert from 'node:assert/strict'
import test from 'node:test'
import { getSessionCookieConfig } from './session-cookie.js'

const now = new Date('2026-01-01T00:00:00.000Z')

test('builds a secure production cookie with a Host prefix and matching expiry', () => {
  const config = getSessionCookieConfig(new Date(now.getTime() + 3_600_000), { now, secure: true })

  assert.equal(config.name, '__Host-narumugai-session')
  assert.deepEqual(config.options, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    expires: new Date('2026-01-01T01:00:00.000Z'),
    maxAge: 3_600,
  })
  assert.equal(Object.hasOwn(config.options, 'domain'), false)
})

test('uses a separate non-Host cookie name when Secure is explicitly disabled', () => {
  const config = getSessionCookieConfig(now.getTime() + 1, { now, secure: false })

  assert.equal(config.name, 'narumugai_session')
  assert.equal(config.options.secure, false)
  assert.equal(config.options.httpOnly, true)
  assert.equal(config.options.maxAge, 1)
})

test('rejects insecure or expired cookie configuration inputs', () => {
  assert.throws(() => getSessionCookieConfig(now.getTime() + 1, { now }), /secure must be explicitly/)
  assert.throws(() => getSessionCookieConfig(now, { now, secure: true }), /must be in the future/)
  assert.throws(() => getSessionCookieConfig('tomorrow', { now, secure: true }), /expiresAt must be/)
})
