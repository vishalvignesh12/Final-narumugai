import test from 'node:test'
import assert from 'node:assert/strict'
import { checkoutProductSchema } from '../lib/checkout-contract.js'

const valid = { productId: '64b000000000000000000001', name: 'Silk Saree', qty: 1, mrp: 2999, sellingPrice: 1999 }

test('stale cart item with missing variantId parses to null', () => {
  const { variantId } = checkoutProductSchema.parse({ ...valid })
  assert.equal(variantId, null)
})

test('string qty and prices coerce to numbers', () => {
  const parsed = checkoutProductSchema.parse({ ...valid, qty: '2', mrp: '2999.00', sellingPrice: '1999.00', variantId: '64b000000000000000000002' })
  assert.equal(parsed.qty, 2); assert.equal(parsed.mrp, 2999); assert.equal(parsed.sellingPrice, 1999)
})

test('qty 0, qty 21, and qty 1.5 are rejected', () => {
  assert.equal(checkoutProductSchema.safeParse({ ...valid, qty: 0 }).success, false)
  assert.equal(checkoutProductSchema.safeParse({ ...valid, qty: 21 }).success, false)
  assert.equal(checkoutProductSchema.safeParse({ ...valid, qty: 1.5 }).success, false)
})

test('variantId "null" string stays a string (legacy sentinel handled by pricing)', () => {
  assert.equal(checkoutProductSchema.parse({ ...valid, variantId: 'null' }).variantId, 'null')
})

test('order payload fixture from a stale cart passes full product array validation', () => {
  const staleCart = [{ productId: '64b000000000000000000001', name: 'Saree', qty: undefined, mrp: '999', sellingPrice: '499' }]
  const payload = { products: staleCart.map(i => ({ ...i, variantId: i.variantId ?? null, qty: Number(i.qty || 1), mrp: Number(i.mrp || 0), sellingPrice: Number(i.sellingPrice || 0) })) }
  assert.equal(checkoutProductSchema.array().safeParse(payload.products).success, true)
})
