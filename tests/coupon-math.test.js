import test from 'node:test'
import assert from 'node:assert/strict'
import { computeCouponState, couponCodeFilter, couponConsumedFilter } from '../lib/coupons.js'

const future = new Date('2026-12-01T00:00:00Z')

test('discount clamps to subtotal', () => {
    const state = computeCouponState({ coupon: { discountPercentage: 100, minShoppingAmount: 0, validity: future, deletedAt: null }, subtotal: 1000 })
    assert.equal(state.valid, true)
    assert.equal(state.discountAmount, 1000)
})

test('coupon validation returns stable reasons', () => {
    assert.equal(computeCouponState({ coupon: { discountPercentage: 10, validity: new Date('2020-01-01'), minShoppingAmount: 0 }, subtotal: 100 }).reason, 'expired')
    assert.equal(computeCouponState({ coupon: { discountPercentage: 10, validity: future, deletedAt: new Date(), minShoppingAmount: 0 }, subtotal: 100 }).reason, 'deleted')
    assert.equal(computeCouponState({ coupon: { discountPercentage: 10, validity: future, minShoppingAmount: 200 }, subtotal: 100 }).reason, 'min_purchase')
    assert.equal(computeCouponState({ coupon: { discountPercentage: 0, validity: future, minShoppingAmount: 0 }, subtotal: 100 }).reason, 'invalid')
})

test('coupon usage filters are conditional', () => {
    assert.deepEqual(couponConsumedFilter({ usageLimit: null }), {})
    assert.deepEqual(couponConsumedFilter({ usageLimit: 5 }), { usedCount: { $lt: 5 } })
})

test('coupon code filter escapes regex metacharacters', () => {
    assert.equal(couponCodeFilter('SAVE.10*').$regex, '^save\\.10\\*$')
})
