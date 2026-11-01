export function createSessionRepository(prisma) {
  if (!prisma?.session) {
    throw new TypeError('A Prisma client with the session model is required.')
  }

  return {
    create({ userId, tokenHash, expiresAt }) {
      return prisma.session.create({
        data: { userId, tokenHash, expiresAt },
        select: { id: true, expiresAt: true },
      })
    },

    findByTokenHash(tokenHash) {
      return prisma.session.findUnique({
        where: { tokenHash },
        select: {
          id: true,
          userId: true,
          expiresAt: true,
          revokedAt: true,
          user: {
            select: { id: true, role: true, status: true },
          },
        },
      })
    },

    revokeByTokenHash(tokenHash, revokedAt) {
      return prisma.session.updateMany({
        where: { tokenHash, revokedAt: null },
        data: { revokedAt },
      })
    },
  }
}
