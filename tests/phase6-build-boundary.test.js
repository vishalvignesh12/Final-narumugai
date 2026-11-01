import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { generateOTP } from '../lib/generateOTP.js'

test('OTP generator produces six-digit codes', () => {
    for (let attempt = 0; attempt < 100; attempt += 1) {
        assert.match(generateOTP(), /^\d{6}$/)
    }
})

test('browser-safe helpers do not import the Node crypto module', async () => {
    const helper = await readFile(new URL('../lib/helperFunction.js', import.meta.url), 'utf8')

    assert.doesNotMatch(helper, /node:crypto|generateOTP/)
})
