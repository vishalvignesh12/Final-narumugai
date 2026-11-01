let handlersPromise

export function getCheckoutRouteHandlers() {
  handlersPromise ??= Promise.all([
    import('../../db/prisma.js'),
    import('../auth/session-repository.js'),
    import('../auth/session-service.js'),
    import('./checkout-repository.js'),
    import('./checkout-service.js'),
    import('./checkout-route-handlers.js'),
    import('../payments/payment-repository.js'),
    import('../payments/payment-service.js'),
    import('../payments/payu-provider.js'),
  ]).then(([{ prisma }, sessionRepository, sessionService, checkoutRepository, checkoutService, routes, paymentRepository, paymentService, payu]) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://narumugai.com'
    const provider = {
      createCheckoutForm: (input) => payu.createPayUProviderFromEnv().createCheckoutForm(input),
      verifyResponse: (input) => payu.createPayUProviderFromEnv().verifyResponse(input),
      getTransactionStatus: (transactionId) => payu.createPayUProviderFromEnv().getTransactionStatus(transactionId),
    }
    const payments = paymentService.createPaymentService({
      repository: paymentRepository.createPaymentRepository(prisma),
      provider,
    })
    return routes.createCheckoutRouteHandlers({
      sessionService: sessionService.createSessionService({ repository: sessionRepository.createSessionRepository(prisma) }),
      checkoutService: checkoutService.createCheckoutService({ repository: checkoutRepository.createCheckoutRepository(prisma) }),
      paymentService: payments,
      secure: process.env.NODE_ENV === 'production',
      baseUrl,
    })
  }).catch((error) => { handlersPromise = null; throw error })
  return handlersPromise
}
