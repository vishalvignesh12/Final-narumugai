import test from 'node:test'
import assert from 'node:assert/strict'
import { createAdminService, AdminInputError } from './admin-service.js'

test('admin product creation requires sellable variants and unique SKUs', async () => {
  let called = false
  const admin = createAdminService({ repository: { createProduct: async () => { called = true } } })
  assert.throws(() => admin.createProduct({ categoryId: 'bad' }, 'admin'), AdminInputError)
  assert.equal(called, false)
})

test('admin percentage coupons cannot exceed 100 percent', async () => {
  const admin = createAdminService({ repository: { createCoupon: async () => true } })
  assert.throws(() => admin.createCoupon({ code: 'MAX', discountKind: 'PERCENT', discountValue: 101 }, 'admin'), AdminInputError)
})

test('admin refund completion requires confirmation and a provider reference', () => {
  const admin = createAdminService({ repository: { transitionOrder: async () => true } })
  assert.throws(() => admin.transitionOrder('order', 'REFUNDED', 'admin'), AdminInputError)
})
