function amountToPaise(amount) {
  if (!/^(?:0|[1-9][0-9]*)(?:\.[0-9]{1,2})?$/.test(String(amount))) return null
  const [whole, fraction = ''] = String(amount).split('.')
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'))
}

function callbackDedupeKey(fields) {
  return `payu:${fields.txnid}:${fields.mihpayid || 'none'}:${String(fields.status).toLowerCase()}`
}

async function releaseReservation(tx, reservation, now, targetStatus) {
  if (!reservation || reservation.status !== 'ACTIVE') return false
  for (const item of reservation.items) {
    const changed = await tx.inventory.updateMany({
      where: { id: item.inventoryId, reserved: { gte: item.quantity } },
      data: { reserved: { decrement: item.quantity }, version: { increment: 1 } },
    })
    if (changed.count !== 1) throw new Error('Reservation inventory is inconsistent.')
    await tx.inventoryMovement.create({
      data: { inventoryId: item.inventoryId, kind: 'RELEASED', quantityDelta: -item.quantity, reference: reservation.orderId },
    })
  }
  await tx.inventoryReservation.update({ where: { id: reservation.id }, data: { status: targetStatus, releasedAt: now } })
  return true
}

export function createPaymentRepository(prisma) {
  return {
    async recordInitiation(paymentId, transactionId) {
      await prisma.payment.updateMany({
        where: { id: paymentId, status: 'INITIATION_PENDING' },
        data: { providerReference: transactionId, status: 'PENDING' },
      })
    },

    async processVerifiedCallback(fields, { now }) {
      const paise = amountToPaise(fields.amount)
      if (paise === null) throw new Error('Payment amount is invalid.')
      return prisma.$transaction(async (tx) => {
        const payment = await tx.payment.findFirst({
          where: { providerReference: fields.txnid },
          include: { order: { include: { coupon: true, reservation: { include: { items: true } } } } },
        })
        if (!payment) throw new Error('Payment reference was not found.')
        if (payment.amountPaise !== paise || payment.currency !== 'INR') throw new Error('Payment amount does not match the order.')
        const dedupeKey = callbackDedupeKey(fields)
        const previous = await tx.paymentEvent.findUnique({ where: { dedupeKey } })
        if (previous) return { duplicate: true, orderNumber: payment.order.orderNumber, status: payment.status }
        await tx.paymentEvent.create({
          data: { paymentId: payment.id, dedupeKey, verified: true, payloadDigest: null },
        })

        if (payment.status === 'SUCCEEDED' || payment.status === 'REFUND_PENDING' || payment.status === 'REFUNDED') {
          await tx.paymentEvent.update({ where: { dedupeKey }, data: { processedAt: now } })
          return { duplicate: true, orderNumber: payment.order.orderNumber, status: payment.status }
        }

        if (String(fields.status).toLowerCase() === 'success') {
          const reservation = payment.order.reservation
          if (reservation?.status === 'ACTIVE' && reservation.expiresAt > now) {
            for (const item of reservation.items) {
              const updated = await tx.inventory.updateMany({
                where: { id: item.inventoryId, onHand: { gte: item.quantity }, reserved: { gte: item.quantity } },
                data: { onHand: { decrement: item.quantity }, reserved: { decrement: item.quantity }, version: { increment: 1 } },
              })
              if (updated.count !== 1) throw new Error('Reserved inventory could not be consumed.')
              await tx.inventoryMovement.create({
                data: { inventoryId: item.inventoryId, kind: 'SOLD', quantityDelta: -item.quantity, reference: payment.orderId },
              })
            }
            await tx.inventoryReservation.update({ where: { id: reservation.id }, data: { status: 'CONSUMED', consumedAt: now } })
            await tx.order.update({ where: { id: payment.orderId }, data: { status: 'CONFIRMED' } })
            if (payment.order.couponId) {
              await tx.couponRedemption.create({ data: { couponId: payment.order.couponId, userId: payment.order.userId, orderId: payment.orderId } })
            }
            await tx.payment.update({ where: { id: payment.id }, data: { status: 'SUCCEEDED', providerTransactionId: fields.mihpayid || fields.txnid, confirmedAt: now } })
          } else {
            // The payment arrived too late to consume stock. Release an expired reservation
            // so the pending refund does not keep inventory unavailable indefinitely.
            await releaseReservation(tx, reservation, now, 'RELEASED')
            await tx.order.update({ where: { id: payment.orderId }, data: { status: 'REFUND_PENDING' } })
            await tx.payment.update({ where: { id: payment.id }, data: { status: 'REFUND_PENDING', providerTransactionId: fields.mihpayid || fields.txnid, confirmedAt: now } })
          }
        } else if (['failure', 'failed', 'cancelled', 'canceled'].includes(String(fields.status).toLowerCase())) {
          const changed = await releaseReservation(tx, payment.order.reservation, now, 'RELEASED')
          await tx.order.update({ where: { id: payment.orderId }, data: { status: changed ? 'PAYMENT_FAILED' : 'REFUND_PENDING' } })
          await tx.payment.update({ where: { id: payment.id }, data: { status: changed ? 'FAILED' : 'UNKNOWN' } })
        } else {
          await tx.payment.update({ where: { id: payment.id }, data: { status: 'UNKNOWN' } })
        }
        await tx.paymentEvent.update({ where: { dedupeKey }, data: { processedAt: now } })
        const resultStatus = String(fields.status).toLowerCase()
        return { duplicate: false, orderNumber: payment.order.orderNumber, status: resultStatus === 'success' ? 'processed' : ['failure', 'failed', 'cancelled', 'canceled'].includes(resultStatus) ? 'failed' : 'unknown' }
      }, { isolationLevel: 'Serializable' })
    },

    async markExpiredForReconciliation(now) {
      // A timeout is not proof of payment failure. Return candidates for a provider status lookup;
      // inventory remains reserved until PayU reports a definitive outcome.
      const candidates = await prisma.inventoryReservation.findMany({
        where: { status: 'ACTIVE', expiresAt: { lte: now } },
        select: { id: true, orderId: true, order: { select: { orderNumber: true, payments: { select: { id: true, providerReference: true, status: true, amountPaise: true } } } } },
        take: 100,
        orderBy: { expiresAt: 'asc' },
      })
      return { candidates, released: 0, unresolved: candidates.length }
    },
  }
}
