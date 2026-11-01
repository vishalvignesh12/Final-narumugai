import { z } from 'zod'

const codeSchema = z.string().trim().min(2).max(64).regex(/^[a-zA-Z0-9_-]+$/)

export class CouponValidationError extends Error {}
export class CouponUnavailableError extends Error {}

export function computeCouponDiscount(coupon, subtotalPaise) {
  if (!Number.isSafeInteger(subtotalPaise) || subtotalPaise < 0) throw new CouponValidationError('Cart subtotal is invalid.')
  if (subtotalPaise < coupon.minimumSpendPaise) throw new CouponUnavailableError('Cart does not meet the coupon minimum spend.')
  let discountPaise
  if (coupon.discountKind === 'PERCENT') discountPaise = Math.floor(subtotalPaise * coupon.discountValue / 100)
  else if (coupon.discountKind === 'FIXED') discountPaise = coupon.discountValue
  else throw new CouponValidationError('Coupon discount type is invalid.')
  if (coupon.maximumDiscountPaise != null) discountPaise = Math.min(discountPaise, coupon.maximumDiscountPaise)
  return Math.min(subtotalPaise, discountPaise)
}

export function createCouponService({ repository, now = () => new Date() }) {
  return {
    async validate(actor, code) {
      const parsed = codeSchema.safeParse(code)
      if (!parsed.success) throw new CouponValidationError('Coupon code is invalid.')
      const result = await repository.getCartAndCoupon(actor, parsed.data.toUpperCase(), now())
      if (!result?.coupon) throw new CouponUnavailableError('Coupon is invalid or expired.')
      const discountPaise = computeCouponDiscount(result.coupon, result.subtotalPaise)
      if (result.globalLimitReached || result.perUserLimitReached) throw new CouponUnavailableError('Coupon usage limit has been reached.')
      return { code: result.coupon.code, subtotalPaise: result.subtotalPaise, discountPaise, totalPaise: result.subtotalPaise - discountPaise }
    },
  }
}
