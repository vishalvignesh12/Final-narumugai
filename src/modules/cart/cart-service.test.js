import test from 'node:test'
import assert from 'node:assert/strict'
import { createCartService, CartValidationError, hashGuestCartToken, createGuestCartToken } from './cart-service.js'

test('cart quantities and variant identifiers are validated', async () => {
  const cart = createCartService({ repository: { setItem: async () => ({ ok: true }) } })
  await assert.rejects(cart.setItem({ userId: 'u' }, 'invalid', 1), CartValidationError)
  await assert.rejects(cart.setItem({ userId: 'u' }, 'ee44f734-6ca5-4010-a108-05e8e161b89d', 21), CartValidationError)
})

test('guest cart tokens have high entropy and only hashes are used as owners', () => {
  const token = createGuestCartToken()
  assert.equal(token.length, 43)
  assert.match(hashGuestCartToken(token), /^[a-f0-9]{64}$/)
  assert.notEqual(hashGuestCartToken(token), token)
})

test('unavailable cart variants return a domain conflict', async () => {
  const cart = createCartService({ repository: { setItem: async () => null } })
  await assert.rejects(cart.setItem({ guestTokenHash: 'a'.repeat(64) }, 'ee44f734-6ca5-4010-a108-05e8e161b89d', 1))
})
