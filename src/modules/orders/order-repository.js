const safeOrderInclude = {
  items: true,
  payments: { select: { provider: true, amountPaise: true, currency: true, status: true, createdAt: true, confirmedAt: true } },
}

function ownerWhere(actor) {
  return actor.userId ? { userId: actor.userId } : { guestTokenHash: actor.guestTokenHash, userId: null }
}

export function createOrderRepository(prisma) {
  return {
    async list(actor, page) {
      return prisma.order.findMany({
        where: ownerWhere(actor), include: safeOrderInclude,
        orderBy: { createdAt: 'desc' }, skip: (page - 1) * 20, take: 20,
      })
    },
    get(actor, orderNumber) {
      return prisma.order.findFirst({ where: { orderNumber, ...ownerWhere(actor) }, include: safeOrderInclude })
    },
    async requestCancellation(actor, orderNumber, reason) {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.findFirst({ where: { orderNumber, ...ownerWhere(actor) }, include: { payments: true } })
        if (!order) return null
        if (['PENDING_PAYMENT', 'PAYMENT_FAILED', 'EXPIRED', 'CANCELLED'].includes(order.status)) {
          if (order.status !== 'PENDING_PAYMENT') throw new Error('Order cannot be cancelled in its current state.')
          const payment = order.payments.at(-1)
          if (payment && !['FAILED'].includes(payment.status)) throw new Error('Payment outcome must be resolved before cancellation.')
          await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED', cancellationReason: reason } })
          return { status: 'CANCELLED', approved: true }
        }
        if (!['CONFIRMED', 'PROCESSING'].includes(order.status)) throw new Error('Order cannot be cancelled in its current state.')
        await tx.order.update({ where: { id: order.id }, data: { status: 'REFUND_PENDING', cancellationReason: reason } })
        return { status: 'REFUND_PENDING', approved: false }
      }, { isolationLevel: 'Serializable' })
    },
  }
}
