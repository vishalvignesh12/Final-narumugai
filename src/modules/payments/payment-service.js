export class PaymentCallbackError extends Error {}

export function createPaymentService({ repository, provider, now = () => new Date() }) {
  return {
    async processCallback(fields) {
      if (!provider.verifyResponse(fields)) throw new PaymentCallbackError('Invalid payment callback signature.')
      if (!fields.txnid || !fields.status || !fields.amount) throw new PaymentCallbackError('Payment callback is incomplete.')
      return repository.processVerifiedCallback(fields, { now: now() })
    },
    async getCheckoutForm(order, payment) {
      const form = provider.createCheckoutForm({ order, payment })
      await repository.recordInitiation(payment.id, form.fields.txnid)
      return form
    },
    async processExpiredReservations() {
      const result = await repository.markExpiredForReconciliation(now())
      let reconciled = 0
      let unresolved = 0
      for (const candidate of result.candidates) {
        const payment = candidate.order.payments.find((item) => ['PENDING', 'UNKNOWN'].includes(item.status))
        if (!payment?.providerReference) { unresolved += 1; continue }
        try {
          const providerStatus = await provider.getTransactionStatus(payment.providerReference)
          const status = providerStatus.status === 'captured' ? 'success' : providerStatus.status
          if (!['success', 'failure', 'failed', 'cancelled', 'canceled'].includes(status) || !providerStatus.amount) {
            unresolved += 1
            continue
          }
          await repository.processVerifiedCallback({
            txnid: payment.providerReference,
            status,
            amount: providerStatus.amount,
            mihpayid: providerStatus.mihpayid,
          }, { now: now(), trustedProviderResult: true })
          reconciled += 1
        } catch {
          unresolved += 1
        }
      }
      return { candidates: result.candidates.length, reconciled, unresolved }
    },
  }
}
