export function isExpiredReservation(order, now = new Date()) {
    return order?.status === 'pending-payment'
        && order.reservationExpiresAt != null
        && new Date(order.reservationExpiresAt) < now
}

export function schedulerAuthorized(authHeader, secret) {
    return secret != null && authHeader === `Bearer ${secret}`
}
