import test from 'node:test'
import assert from 'node:assert/strict'
import { createOrderService, OrderInputError } from './order-service.js'

test('order routes validate pagination, order number, and cancellation reason', async () => {
  const service = createOrderService({ repository: { get: async () => null, cancel: async () => null } })
  await assert.rejects(service.list({ userId: 'u' }, 0), OrderInputError)
  await assert.rejects(service.get({ userId: 'u' }, '../private'), OrderInputError)
  await assert.rejects(service.cancel({ userId: 'u' }, 'NM-123456789', 'no'), OrderInputError)
})

test('order lookup always forwards an actor-scoped query', async () => {
  let actor
  const service = createOrderService({ repository: { get: async (input, orderNumber) => { actor = input; return orderNumber } } })
  assert.equal(await service.get({ userId: 'user-id' }, 'NM-12345678'), 'NM-12345678')
  assert.deepEqual(actor, { userId: 'user-id' })
})
