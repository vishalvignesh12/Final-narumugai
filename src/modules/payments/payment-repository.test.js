import test from 'node:test'
import assert from 'node:assert/strict'
import { createPaymentRepository } from './payment-repository.js'

function paymentDb({ existingEvent = null } = {}) {
  const state = {
    payment: { id: 'payment-id', status: 'PENDING', amountPaise: 1234, currency: 'INR', orderId: 'order-id', providerReference: 'tx-1' },
    order: {
      id: 'order-id', orderNumber: 'NM-12345678', status: 'PENDING_PAYMENT', couponId: null, userId: null,
      reservation: { id: 'reservation-id', orderId: 'order-id', status: 'ACTIVE', expiresAt: new Date('2026-01-01T00:10:00Z'), items: [{ inventoryId: 'inventory-id', variantId: 'variant-id', quantity: 2 }] },
    },
    event: existingEvent,
    inventoryUpdates: [],
    movements: [],
  }
  const tx = {
    payment: {
      findFirst: async () => ({ ...state.payment, order: state.order }),
      update: async ({ data }) => { Object.assign(state.payment, data); return state.payment },
    },
    paymentEvent: {
      findUnique: async () => state.event,
      create: async ({ data }) => { state.event = data },
      update: async () => {},
    },
    inventory: { updateMany: async (input) => { state.inventoryUpdates.push(input); return { count: 1 } } },
    inventoryMovement: { create: async ({ data }) => { state.movements.push(data) } },
    inventoryReservation: { update: async ({ data }) => { Object.assign(state.order.reservation, data) } },
    order: { update: async ({ data }) => { Object.assign(state.order, data) } },
    couponRedemption: { create: async () => {} },
  }
  const prisma = { $transaction: (callback) => callback(tx) }
  return { repository: createPaymentRepository(prisma), state }
}

test('verified success consumes only reserved stock and advances order state once', async () => {
  const { repository, state } = paymentDb()
  const result = await repository.processVerifiedCallback({ txnid: 'tx-1', status: 'success', amount: '12.34', mihpayid: 'payu-1' }, { now: new Date('2026-01-01T00:05:00Z') })
  assert.equal(result.status, 'processed')
  assert.equal(state.order.status, 'CONFIRMED')
  assert.equal(state.order.reservation.status, 'CONSUMED')
  assert.equal(state.inventoryUpdates[0].data.onHand.decrement, 2)
  assert.equal(state.movements[0].kind, 'SOLD')
})

test('verified failure releases reserved quantity without changing on-hand stock', async () => {
  const { repository, state } = paymentDb()
  const result = await repository.processVerifiedCallback({ txnid: 'tx-1', status: 'failure', amount: '12.34', mihpayid: 'payu-1' }, { now: new Date('2026-01-01T00:05:00Z') })
  assert.equal(result.status, 'failed')
  assert.equal(state.order.status, 'PAYMENT_FAILED')
  assert.equal(state.order.reservation.status, 'RELEASED')
  assert.equal(state.inventoryUpdates[0].data.reserved.decrement, 2)
  assert.equal(state.inventoryUpdates[0].data.onHand, undefined)
})

test('late captured payment releases expired inventory and waits for refund review', async () => {
  const { repository, state } = paymentDb()
  const result = await repository.processVerifiedCallback({ txnid: 'tx-1', status: 'success', amount: '12.34', mihpayid: 'payu-late' }, { now: new Date('2026-01-01T00:11:00Z') })
  assert.equal(result.status, 'processed')
  assert.equal(state.order.status, 'REFUND_PENDING')
  assert.equal(state.payment.status, 'REFUND_PENDING')
  assert.equal(state.order.reservation.status, 'RELEASED')
  assert.equal(state.inventoryUpdates[0].data.reserved.decrement, 2)
  assert.equal(state.inventoryUpdates[0].data.onHand, undefined)
  assert.equal(state.movements[0].kind, 'RELEASED')
})

test('replayed provider event has no repeated inventory effect', async () => {
  const { repository, state } = paymentDb({ existingEvent: { dedupeKey: 'payu:tx-1:payu-1:success' } })
  const result = await repository.processVerifiedCallback({ txnid: 'tx-1', status: 'success', amount: '12.34', mihpayid: 'payu-1' }, { now: new Date('2026-01-01T00:05:00Z') })
  assert.equal(result.duplicate, true)
  assert.equal(state.inventoryUpdates.length, 0)
})
