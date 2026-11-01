export function createWishlistRepository(prisma) {
  return {
    async list(userId) {
      const wishlist = await prisma.wishlist.findUnique({
        where: { userId },
        include: { items: { include: { product: { include: { category: true, images: true, variants: { where: { status: 'ACTIVE' }, include: { inventory: true } } } } } } },
      })
      return wishlist?.items ?? []
    },
    async add(userId, productId) {
      return prisma.$transaction(async (tx) => {
        const product = await tx.product.findFirst({ where: { id: productId, status: 'ACTIVE' }, select: { id: true } })
        if (!product) return false
        const wishlist = await tx.wishlist.upsert({ where: { userId }, create: { userId }, update: {} })
        await tx.wishlistItem.upsert({
          where: { wishlistId_productId: { wishlistId: wishlist.id, productId } },
          create: { wishlistId: wishlist.id, productId },
          update: {},
        })
        return true
      })
    },
    async remove(userId, productId) {
      const wishlist = await prisma.wishlist.findUnique({ where: { userId }, select: { id: true } })
      if (!wishlist) return
      await prisma.wishlistItem.deleteMany({ where: { wishlistId: wishlist.id, productId } })
    },
  }
}
