export function normalizeCouponCode(code) {
    return String(code ?? '').trim().toLowerCase()
}

export function escapeRegex(value) {
    return normalizeCouponCode(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function couponCodeFilter(code) {
    return { $regex: `^${escapeRegex(code)}$`, $options: 'i' }
}

export function computeCouponState({ coupon, subtotal, now = new Date() }) {
    if (!coupon) return { valid: false, reason: 'invalid' }
    if (coupon.deletedAt) return { valid: false, reason: 'deleted' }
    if (!coupon.validity || new Date(coupon.validity) < now) return { valid: false, reason: 'expired' }
    const pct = Number(coupon.discountPercentage)
    if (!(pct > 0 && pct <= 100)) return { valid: false, reason: 'invalid' }
    if (Number(subtotal) < Number(coupon.minShoppingAmount || 0)) return { valid: false, reason: 'min_purchase' }
    return {
        valid: true,
        discountAmount: Number(Math.min(Number(subtotal) * pct / 100, Number(subtotal)).toFixed(2))
    }
}

export function couponConsumedFilter(coupon) {
    return coupon?.usageLimit == null ? {} : { usedCount: { $lt: coupon.usageLimit } }
}
