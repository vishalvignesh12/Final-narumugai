export function createCouponRepository(prisma) {
  return {
    async getCartAndCoupon(actor, code, now) {
      const cart = await prisma.cart.findUnique({
        where: actor.userId ? { userId: actor.userId } : { guestTokenHash: actor.guestTokenHash },
        include: {
          items: {
            include: {
              variant: { select: { pricePaise: true, status: true, product: { select: { status: true } } } },
            },
          },
        },
      })
      if (!cart?.items.length || cart.items.some((item) => item.variant.status !== 'ACTIVE' || item.variant.product.status !== 'ACTIVE')) return null
      const coupon = await prisma.coupon.findUnique({ where: { code } })
      if (!coupon || !coupon.active || (coupon.startsAt && coupon.startsAt > now) || (coupon.expiresAt && coupon.expiresAt < now)) return null
      const subtotalPaise = cart.items.reduce((sum, item) => sum + item.variant.pricePaise * item.quantity, 0)
      const [globalRedemptions, globalReservations, userRedemptions, userReservations] = await Promise.all([
        coupon.globalLimit ? prisma.couponRedemption.count({ where: { couponId: coupon.id } }) : 0,
        coupon.globalLimit ? prisma.order.count({ where: { couponId: coupon.id, reservation: { status: 'ACTIVE' } } }) : 0,
        actor.userId && coupon.perUserLimit ? prisma.couponRedemption.count({ where: { couponId: coupon.id, userId: actor.userId } }) : 0,
        actor.userId && coupon.perUserLimit ? prisma.order.count({ where: { couponId: coupon.id, userId: actor.userId, reservation: { status: 'ACTIVE' } } }) : 0,
      ])
      const globalUsage = globalRedemptions + globalReservations
      const userUsage = userRedemptions + userReservations
      return {
        coupon,
        subtotalPaise,
        globalLimitReached: Boolean(coupon.globalLimit && globalUsage >= coupon.globalLimit),
        perUserLimitReached: Boolean(coupon.perUserLimit && userUsage >= coupon.perUserLimit),
      }
    },
  }
}
