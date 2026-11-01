import { NextResponse } from 'next/server.js'
export async function POST(request) {
  const secret = process.env.RESERVATION_EXPIRY_SECRET
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: 'A valid scheduler token is required.' } }, { status: 401 })
  }
  try {
    const [{ default: prisma }, { createPaymentRepository }, { createPaymentService }, { createPayUProviderFromEnv }] = await Promise.all([
      import('@/src/db/prisma.js'),
      import('@/src/modules/payments/payment-repository.js'),
      import('@/src/modules/payments/payment-service.js'),
      import('@/src/modules/payments/payu-provider.js'),
    ])
    const provider = {
      createCheckoutForm: (input) => createPayUProviderFromEnv().createCheckoutForm(input),
      verifyResponse: (input) => createPayUProviderFromEnv().verifyResponse(input),
      getTransactionStatus: (id) => createPayUProviderFromEnv().getTransactionStatus(id),
    }
    const paymentService = createPaymentService({ repository: createPaymentRepository(prisma), provider })
    const result = await paymentService.processExpiredReservations()
    return NextResponse.json({ data: result })
  } catch {
    return NextResponse.json({ error: { code: 'INTERNAL_ERROR', message: 'Reservation reconciliation scan failed.' } }, { status: 503 })
  }
}
