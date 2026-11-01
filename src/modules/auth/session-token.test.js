import assert from 'node:assert/strict'
import test from 'node:test'
import { createSessionToken, hashSessionToken } from './session-token.js'

test('creates opaque 256-bit tokens and a database-ready SHA-256 hash', () => {
  const { token, tokenHash } = createSessionToken()

  assert.match(token, /^[A-Za-z0-9_-]{43}$/)
  assert.match(tokenHash, /^[a-f0-9]{64}$/)
  assert.equal(hashSessionToken(token), tokenHash)
})

test('creates distinct tokens for separate sessions', () => {
  const first = createSessionToken()
  const second = createSessionToken()

  assert.notEqual(first.token, second.token)
  assert.notEqual(first.tokenHash, second.tokenHash)
})

test('rejects malformed or noncanonical session tokens', () => {
  assert.throws(() => hashSessionToken(''), /canonical 256-bit/)
  assert.throws(() => hashSessionToken('a'.repeat(43)), /canonical 256-bit/)
  assert.throws(() => hashSessionToken(null), /canonical 256-bit/)
})
