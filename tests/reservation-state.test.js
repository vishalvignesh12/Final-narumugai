import test from 'node:test'
import assert from 'node:assert/strict'
import { isExpiredReservation, schedulerAuthorized } from '../lib/reservationState.js'

test('matches only stale pending-payment orders', () => {
    const now = new Date('2026-11-01T10:00:00Z')
    const base = { status: 'pending-payment', reservationExpiresAt: new Date('2026-11-01T09:59:00Z') }
    assert.equal(isExpiredReservation(base, now), true)
    assert.equal(isExpiredReservation({ ...base, reservationExpiresAt: new Date('2026-11-01T10:01:00Z') }, now), false)
    assert.equal(isExpiredReservation({ ...base, status: 'processing' }, now), false)
    assert.equal(isExpiredReservation({ ...base, reservationExpiresAt: null }, now), false)
})

test('scheduler authorization requires configured bearer secret', () => {
    assert.equal(schedulerAuthorized('Bearer s3cret', 's3cret'), true)
    assert.equal(schedulerAuthorized('s3cret', 's3cret'), false)
    assert.equal(schedulerAuthorized('Bearer s3cret', undefined), false)
})
