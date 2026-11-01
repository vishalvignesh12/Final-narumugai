import test from 'node:test'
import assert from 'node:assert/strict'
import { computeCouponDiscount, createCouponService, CouponUnavailableError } from './coupon-service.js'

test('coupon percentages use integer paise and respect maximum discount', () => {
  assert.equal(computeCouponDiscount({ discountKind: 'PERCENT', discountValue: 15, minimumSpendPaise: 0, maximumDiscountPaise: 1000 }, 9999), 1000)
  assert.equal(computeCouponDiscount({ discountKind: 'FIXED', discountValue: 5000, minimumSpendPaise: 0 }, 4000), 4000)
})

test('coupon preview uses repository cart subtotal and rejects limit exhaustion', async () => {
  const service = createCouponService({ repository: { getCartAndCoupon: async () => ({
    coupon: { code: 'SAVE10', discountKind: 'PERCENT', discountValue: 10, minimumSpendPaise: 0 },
    subtotalPaise: 2000, globalLimitReached: false, perUserLimitReached: false,
  }) } })
  assert.deepEqual(await service.validate({ userId: 'user' }, 'save10'), {
    code: 'SAVE10', subtotalPaise: 2000, discountPaise: 200, totalPaise: 1800,
  })
  const unavailable = createCouponService({ repository: { getCartAndCoupon: async () => ({ coupon: { discountKind: 'FIXED', discountValue: 1, minimumSpendPaise: 0 }, subtotalPaise: 10, globalLimitReached: true }) } })
  await assert.rejects(unavailable.validate({ userId: 'user' }, 'SAVE10'), CouponUnavailableError)
})
