import test from 'node:test'
import assert from 'node:assert/strict'
import { createCheckoutService, CheckoutValidationError } from './checkout-service.js'

test('checkout requires one valid shipping address and idempotency key', async () => {
  let calls = 0
  const service = createCheckoutService({ repository: { createCheckout: async () => { calls += 1 } } })
  await assert.rejects(service.checkout({ userId: 'ee44f734-6ca5-4010-a108-05e8e161b89d' }, {
    idempotencyKey: 'checkout-12345678', contactName: 'A', contactPhone: '+919876543210',
  }), CheckoutValidationError)
  assert.equal(calls, 0)
})

test('checkout rejects client-supplied prices and totals', async () => {
  const service = createCheckoutService({ repository: { createCheckout: async () => { throw new Error('must not run') } } })
  await assert.rejects(service.checkout({ userId: 'ee44f734-6ca5-4010-a108-05e8e161b89d' }, {
    idempotencyKey: 'checkout-12345678', addressId: '4d4cf809-ad78-4894-a74d-81125c36d213',
    contactName: 'A', contactPhone: '+919876543210', totalPaise: 1,
  }), CheckoutValidationError)
})

test('checkout uses server-owned actor and fixed ten-minute reservation policy', async () => {
  let captured
  const service = createCheckoutService({ repository: { createCheckout: async (...args) => { captured = args; return { ok: true } } }, now: () => new Date('2026-01-01T00:00:00Z') })
  await service.checkout({ userId: 'ee44f734-6ca5-4010-a108-05e8e161b89d' }, {
    idempotencyKey: 'checkout-12345678', addressId: '4d4cf809-ad78-4894-a74d-81125c36d213',
    contactName: 'A', contactPhone: '+919876543210',
  })
  assert.equal(captured[0].userId, 'ee44f734-6ca5-4010-a108-05e8e161b89d')
  assert.equal(captured[2].reservationDurationMs, 600000)
})
