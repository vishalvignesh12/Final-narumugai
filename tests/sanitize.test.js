import test from 'node:test'
import assert from 'node:assert/strict'
import { sanitizeGatewayText } from '../lib/sanitize.js'

test('strips controls, caps length, and supplies a fallback', () => {
    assert.equal(sanitizeGatewayText('bad\x00\x1Fvalue'.padEnd(600, 'x')).length, 500)
    assert.equal(sanitizeGatewayText('clean reason'), 'clean reason')
    assert.equal(sanitizeGatewayText(undefined), 'Unknown')
    assert.equal(sanitizeGatewayText('\n\r\t'), 'Unknown')
})
