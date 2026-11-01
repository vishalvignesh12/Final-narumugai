import test from 'node:test'
import assert from 'node:assert/strict'
import { createPayUProvider, verifyPayUResponse } from './payu-provider.js'
import { createHash } from 'node:crypto'

test('PayU form uses server amount and response verification is timing-safe and strict', () => {
  const provider = createPayUProvider({ key: 'merchant', salt: 'secret', endpoint: 'https://payu.test', baseUrl: 'https://shop.test' })
  const result = provider.createCheckoutForm({
    order: { orderNumber: 'NM-ORDER', contactName: 'Ada Lovelace', contactEmail: 'ada@example.com', contactPhone: '+919876543210' },
    payment: { amountPaise: 12345 },
  })
  assert.equal(result.fields.amount, '123.45')
  assert.equal(result.fields.surl, 'https://shop.test/api/v2/payments/payu/callback')
  assert.equal(result.fields.hash.length, 128)

  const callback = { key: 'merchant', status: 'success', email: result.fields.email, firstname: result.fields.firstname, productinfo: result.fields.productinfo, amount: result.fields.amount, txnid: result.fields.txnid }
  const source = `secret|${callback.status}|||||||||||${callback.email}|${callback.firstname}|${callback.productinfo}|${callback.amount}|${callback.txnid}|${callback.key}`
  callback.hash = createHash('sha512').update(source).digest('hex')
  assert.equal(verifyPayUResponse(callback, { key: 'merchant', salt: 'secret' }), true)
  assert.equal(verifyPayUResponse({ ...callback, amount: '1.00' }, { key: 'merchant', salt: 'secret' }), false)
})

test('PayU reconciliation uses the signed verify_payment request and reads provider status', async () => {
  let request
  const provider = createPayUProvider({ key: 'merchant', salt: 'secret', endpoint: 'https://test.payu.in/_payment', baseUrl: 'https://shop.test' })
  const result = await provider.getTransactionStatus('txn-1', {
    fetchImpl: async (url, init) => {
      request = { url, init }
      return { ok: true, json: async () => ({ status: 1, transaction_details: { 'txn-1': { status: 'failure', amt: '12.30', mihpayid: 'payu-id' } } }) }
    },
  })
  assert.equal(request.url, 'https://test.payu.in/merchant/postservice?form=2')
  assert.equal(request.init.body.get('command'), 'verify_payment')
  assert.equal(request.init.body.get('var1'), 'txn-1')
  assert.equal(request.init.body.get('hash').length, 128)
  assert.deepEqual(result, { status: 'failure', amount: '12.30', mihpayid: 'payu-id' })
})
