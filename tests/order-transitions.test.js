import test from 'node:test'
import assert from 'node:assert/strict'
import { canTransition, PAYMENT_STATUS_SYNC, TRANSITION_EFFECTS } from '../lib/orderTransitions.js'

test('legal and illegal transitions', () => {
    assert.equal(canTransition('processing', 'shipped'), true)
    assert.equal(canTransition('delivered', 'processing'), false)
    assert.equal(canTransition('cancel-requested', 'refunded'), true)
    assert.equal(canTransition('failed', 'processing'), false)
})

test('stock restore only applies to cancelled and refunded', () => {
    assert.equal(TRANSITION_EFFECTS.cancelled.restoreStock, true)
    assert.equal(TRANSITION_EFFECTS.shipped?.restoreStock, undefined)
})

test('payment status sync map', () => {
    assert.equal(PAYMENT_STATUS_SYNC.refunded, 'refunded')
    assert.equal(PAYMENT_STATUS_SYNC.cancelled, 'failed')
})
