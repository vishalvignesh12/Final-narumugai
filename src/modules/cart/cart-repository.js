const cartInclude = {
  items: {
    orderBy: { createdAt: 'asc' },
    include: {
      variant: {
        include: {
          product: { include: { images: { orderBy: { position: 'asc' }, take: 1 } } },
          inventory: true,
          optionValues: { include: { optionValue: { include: { optionType: true } } } },
        },
      },
    },
  },
}

function cartWhere(actor) {
  return actor.userId ? { userId: actor.userId } : { guestTokenHash: actor.guestTokenHash }
}

export function createCartRepository(prisma) {
  async function getOrCreate(tx, actor) {
    const where = cartWhere(actor)
    const unique = actor.userId ? { userId: actor.userId } : { guestTokenHash: actor.guestTokenHash }
    return tx.cart.upsert({ where: unique, create: where, update: {} })
  }

  return {
    async list(actor) {
      const cart = await getOrCreate(prisma, actor)
      return prisma.cart.findUnique({ where: { id: cart.id }, include: cartInclude })
    },

    async setItem(actor, variantId, quantity) {
      return prisma.$transaction(async (tx) => {
        const cart = await getOrCreate(tx, actor)
        const variant = await tx.productVariant.findFirst({
          where: { id: variantId, status: 'ACTIVE', product: { status: 'ACTIVE' } },
          select: { id: true },
        })
        if (!variant) return null
        await tx.cartItem.upsert({
          where: { cartId_variantId: { cartId: cart.id, variantId } },
          create: { cartId: cart.id, variantId, quantity },
          update: { quantity },
        })
        return tx.cart.findUnique({ where: { id: cart.id }, include: cartInclude })
      })
    },

    async removeItem(actor, variantId) {
      const cart = await prisma.cart.findUnique({ where: actor.userId ? { userId: actor.userId } : { guestTokenHash: actor.guestTokenHash } })
      if (!cart) return
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id, variantId } })
    },

    async mergeGuestCart(userId, guestTokenHash, maxQuantity) {
      return prisma.$transaction(async (tx) => {
        const guest = await tx.cart.findUnique({ where: { guestTokenHash }, include: cartInclude })
        if (!guest) {
          await tx.order.updateMany({ where: { guestTokenHash, userId: null }, data: { userId, guestTokenHash: null } })
          return { merged: 0, skipped: 0 }
        }
        const userCart = await tx.cart.upsert({ where: { userId }, create: { userId }, update: {}, include: cartInclude })
        let merged = 0
        let skipped = 0
        for (const item of guest.items) {
          const available = item.variant.inventory
            ? item.variant.inventory.onHand - item.variant.inventory.reserved
            : 0
          if (item.variant.status !== 'ACTIVE' || item.variant.product.status !== 'ACTIVE' || available < 1) {
            skipped += 1
            continue
          }
          const existing = await tx.cartItem.findUnique({
            where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
          })
          const quantity = Math.min(maxQuantity, available, item.quantity + (existing?.quantity ?? 0))
          await tx.cartItem.upsert({
            where: { cartId_variantId: { cartId: userCart.id, variantId: item.variantId } },
            create: { cartId: userCart.id, variantId: item.variantId, quantity },
            update: { quantity },
          })
          merged += 1
        }
        await tx.order.updateMany({
          where: { guestTokenHash, userId: null },
          data: { userId, guestTokenHash: null },
        })
        await tx.cart.delete({ where: { id: guest.id } })
        return { merged, skipped }
      })
    },
  }
}
