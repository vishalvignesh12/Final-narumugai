import test from 'node:test'
import assert from 'node:assert/strict'
import { createPaymentService, PaymentCallbackError } from './payment-service.js'

test('payment callback is verified before persistence', async () => {
  let called = false
  const service = createPaymentService({ repository: { processVerifiedCallback: async () => { called = true } }, provider: { verifyResponse: () => false } })
  await assert.rejects(service.processCallback({ txnid: 't', status: 'success', amount: '1.00' }), PaymentCallbackError)
  assert.equal(called, false)
})

test('PayU initiation is persisted before its form is returned', async () => {
  let recorded
  const service = createPaymentService({
    repository: { recordInitiation: async (...args) => { recorded = args } },
    provider: { createCheckoutForm: () => ({ endpoint: 'https://payu.test', fields: { txnid: 'tx1' } }) },
  })
  const form = await service.getCheckoutForm({ id: 'order' }, { id: 'payment' })
  assert.deepEqual(recorded, ['payment', 'tx1'])
  assert.equal(form.fields.txnid, 'tx1')
})
