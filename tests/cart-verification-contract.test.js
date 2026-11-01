import test from 'node:test'
import assert from 'node:assert/strict'
import { clampQty, mapVerifiedLine } from '../lib/cartVerificationContract.js'

test('clamps requested quantity to available stock', () => {
    assert.equal(clampQty(5, 3), 3)
    assert.equal(clampQty(5, 0), 0)
})

test('maps product inventory lines without a variant id', () => {
    const line = mapVerifiedLine({
        source: { qty: 3 },
        dbLine: { inventoryType: 'product', productId: 'p1', variantId: 'fallback-p1', name: 'Saree', mrp: 100, sellingPrice: 80, available: 2 }
    })
    assert.equal(line.variantId, null)
    assert.equal(line.qty, 2)
    assert.equal(line.sellingPrice, 80)
})

test('maps variant lines with variant pricing', () => {
    const line = mapVerifiedLine({
        source: { qty: 1 },
        dbLine: { inventoryType: 'variant', productId: 'p1', variantId: 'v1', name: 'Saree', mrp: 120, sellingPrice: 90, available: 4 }
    })
    assert.equal(line.variantId, 'v1')
    assert.equal(line.sellingPrice, 90)
})
