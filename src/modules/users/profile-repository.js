const profileSelect = {
  id: true,
  phone: true,
  email: true,
  displayName: true,
  phoneVerifiedAt: true,
  createdAt: true,
}

export function createProfileRepository(prisma) {
  if (!prisma?.user) {
    throw new TypeError('A Prisma client with the user model is required.')
  }

  return {
    findById(id) {
      return prisma.user.findUnique({ where: { id }, select: profileSelect })
    },

    async updateById(id, data) {
      try {
        return await prisma.user.update({ where: { id }, data, select: profileSelect })
      } catch (error) {
        if (error?.code === 'P2025') return null
        throw error
      }
    },
  }
}
