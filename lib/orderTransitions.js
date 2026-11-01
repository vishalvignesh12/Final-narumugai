export const ALLOWED_TRANSITIONS = {
    'pending-payment': ['failed', 'cancelled', 'processing', 'cancel-requested'],
    processing: ['shipped', 'cancelled', 'cancel-requested'],
    'cancel-requested': ['cancelled', 'refunded', 'processing'],
    shipped: ['delivered', 'cancelled'],
    delivered: ['refunded'],
    failed: [],
    cancelled: [],
    refunded: []
}

export const TRANSITION_EFFECTS = {
    cancelled: { restoreStock: true },
    refunded: { restoreStock: true }
}

export const PAYMENT_STATUS_SYNC = {
    cancelled: 'failed',
    refunded: 'refunded',
    failed: 'failed',
    processing: 'paid'
}

export function canTransition(from, to) {
    return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}
