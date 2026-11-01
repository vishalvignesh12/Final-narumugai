import { createHash, randomBytes } from 'node:crypto'

function idempotencyScope(actor) {
  return actor.userId ? `user:${actor.userId}` : `guest:${actor.guestTokenHash}`
}

function paymentKey(scope, key) {
  return createHash('sha256').update(`${scope}:${key}:payment`).digest('hex')
}

function couponDiscount(coupon, subtotal) {
  if (coupon.discountKind === 'PERCENT') {
    const value = Math.floor((subtotal * coupon.discountValue) / 100)
    return coupon.maximumDiscountPaise ? Math.min(value, coupon.maximumDiscountPaise) : value
  }
  return Math.min(coupon.discountValue, subtotal)
}

export class CheckoutRepositoryConflictError extends Error {}
export class CheckoutRepositoryNotFoundError extends Error {}

export function createCheckoutRepository(prisma) {
  return {
    async createCheckout(actor, input, { now, reservationDurationMs }) {
      const scope = idempotencyScope(actor)
      return prisma.$transaction(async (tx) => {
        const existing = await tx.order.findUnique({
          where: { idempotencyScope_idempotencyKey: { idempotencyScope: scope, idempotencyKey: input.idempotencyKey } },
          include: { items: true, payments: true },
        })
        if (existing) return { order: existing, idempotent: true }

        const cart = await tx.cart.findUnique({
          where: actor.userId ? { userId: actor.userId } : { guestTokenHash: actor.guestTokenHash },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                    inventory: true,
                    optionValues: { include: { optionValue: { include: { optionType: true } } } },
                  },
                },
              },
            },
          },
        })
        if (!cart?.items.length) throw new CheckoutRepositoryConflictError('Your cart is empty.')
        if (cart.items.some((item) => item.variant.status !== 'ACTIVE' || item.variant.product.status !== 'ACTIVE' || !item.variant.inventory)) {
          throw new CheckoutRepositoryConflictError('A cart item is no longer available.')
        }

        let addressSnapshot
        if (actor.userId) {
          const address = await tx.address.findFirst({ where: { id: input.addressId, userId: actor.userId } })
          if (!address) throw new CheckoutRepositoryNotFoundError('Shipping address not found.')
          addressSnapshot = {
            recipientName: address.recipientName, phone: address.phone, line1: address.line1,
            line2: address.line2, landmark: address.landmark, city: address.city,
            state: address.state, postalCode: address.postalCode, countryCode: address.countryCode,
          }
        } else {
          addressSnapshot = input.address
        }

        const subtotal = cart.items.reduce((total, item) => total + item.variant.pricePaise * item.quantity, 0)
        if (!Number.isSafeInteger(subtotal) || subtotal < 0) throw new CheckoutRepositoryConflictError('Cart total is invalid.')

        let coupon = null
        let discountPaise = 0
        if (input.couponCode) {
          coupon = await tx.coupon.findUnique({ where: { code: input.couponCode.toUpperCase() } })
          if (!coupon || !coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) {
            throw new CheckoutRepositoryConflictError('Coupon is invalid or expired.')
          }
          if (subtotal < coupon.minimumSpendPaise) throw new CheckoutRepositoryConflictError('Cart does not meet the coupon minimum spend.')
          const [redemptions, activeReservations] = await Promise.all([
            tx.couponRedemption.count({ where: { couponId: coupon.id } }),
            tx.order.count({ where: { couponId: coupon.id, reservation: { status: 'ACTIVE' } } }),
          ])
          if (coupon.globalLimit && redemptions + activeReservations >= coupon.globalLimit) throw new CheckoutRepositoryConflictError('Coupon usage limit has been reached.')
          if (actor.userId && coupon.perUserLimit) {
            const [customerRedemptions, customerReservations] = await Promise.all([
              tx.couponRedemption.count({ where: { couponId: coupon.id, userId: actor.userId } }),
              tx.order.count({ where: { couponId: coupon.id, userId: actor.userId, reservation: { status: 'ACTIVE' } } }),
            ])
            if (customerRedemptions + customerReservations >= coupon.perUserLimit) throw new CheckoutRepositoryConflictError('You have already used this coupon.')
          }
          discountPaise = couponDiscount(coupon, subtotal)
        }

        const orderId = cryptoRandomUuid()
        const orderNumber = `NM-${now.getTime().toString(36).toUpperCase()}-${randomBytes(4).toString('hex').toUpperCase()}`
        const totalPaise = subtotal - discountPaise
        const order = await tx.order.create({
          data: {
            id: orderId,
            orderNumber,
            userId: actor.userId ?? null,
            couponId: coupon?.id ?? null,
            guestTokenHash: actor.userId ? null : actor.guestTokenHash,
            idempotencyKey: input.idempotencyKey,
            idempotencyScope: scope,
            subtotalPaise: subtotal,
            discountPaise,
            shippingPaise: 0,
            taxPaise: 0,
            totalPaise,
            contactName: input.contactName,
            contactPhone: input.contactPhone,
            contactEmail: input.contactEmail ?? null,
            addressSnapshot,
            items: {
              create: cart.items.map((item) => ({
                variantId: item.variantId,
                productName: item.variant.product.name,
                sku: item.variant.sku,
                optionSnapshot: item.variant.optionValues.map(({ optionValue }) => ({ type: optionValue.optionType.name, value: optionValue.value })),
                quantity: item.quantity,
                unitPricePaise: item.variant.pricePaise,
                lineTotalPaise: item.variant.pricePaise * item.quantity,
              })),
            },
          },
        })

        const reservationId = cryptoRandomUuid()
        const reservationItems = []
        for (const item of cart.items) {
          const rows = await tx.$queryRaw`
            UPDATE "inventory"
            SET "reserved" = "reserved" + ${item.quantity}, "version" = "version" + 1, "updatedAt" = ${now}
            WHERE "variantId" = ${item.variantId}::uuid AND "onHand" - "reserved" >= ${item.quantity}
            RETURNING "id"
          `
          if (rows.length !== 1) throw new CheckoutRepositoryConflictError(`Insufficient inventory for ${item.variant.product.name}.`)
          reservationItems.push({ inventoryId: rows[0].id, variantId: item.variantId, quantity: item.quantity })
          await tx.inventoryMovement.create({
            data: { inventoryId: rows[0].id, kind: 'RESERVED', quantityDelta: item.quantity, reference: order.id },
          })
        }
        await tx.inventoryReservation.create({
          data: {
            id: reservationId,
            orderId: order.id,
            expiresAt: new Date(now.getTime() + reservationDurationMs),
            items: { create: reservationItems },
          },
        })
        const payment = await tx.payment.create({
          data: {
            orderId: order.id,
            amountPaise: totalPaise,
            idempotencyKey: paymentKey(scope, input.idempotencyKey),
          },
        })
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } })
        return { order: { ...order, items: await tx.orderItem.findMany({ where: { orderId: order.id } }), payments: [payment] }, idempotent: false }
      }, { isolationLevel: 'Serializable' })
    },
  }
}

function cryptoRandomUuid() {
  return randomBytes(16).toString('hex').replace(/^(.{8})(.{4})(.{4})(.{4})(.{12})$/, '$1-$2-$3-$4-$5')
}
