const addressSelect = {
  id: true,
  recipientName: true,
  phone: true,
  line1: true,
  line2: true,
  landmark: true,
  city: true,
  state: true,
  postalCode: true,
  countryCode: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
}

function requirePrisma(prisma) {
  if (!prisma?.address || typeof prisma.$transaction !== 'function') {
    throw new TypeError('A Prisma client with address and transaction support is required.')
  }
}

export function createAddressRepository(prisma) {
  requirePrisma(prisma)

  return {
    listByUserId(userId) {
      return prisma.address.findMany({
        where: { userId },
        orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
        select: addressSelect,
      })
    },

    createForUser(userId, data) {
      if (!data.isDefault) {
        return prisma.address.create({ data: { ...data, userId }, select: addressSelect })
      }

      return prisma.$transaction(async (transaction) => {
        await transaction.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        })
        return transaction.address.create({ data: { ...data, userId }, select: addressSelect })
      })
    },

    async updateForUser(userId, id, data) {
      if (data.isDefault !== true) {
        const [address] = await prisma.address.updateManyAndReturn({
          where: { id, userId },
          data,
          select: addressSelect,
        })
        return address ?? null
      }

      return prisma.$transaction(async (transaction) => {
        const existing = await transaction.address.findFirst({
          where: { id, userId },
          select: { id: true },
        })
        if (!existing) return null

        await transaction.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        })

        const [address] = await transaction.address.updateManyAndReturn({
          where: { id, userId },
          data,
          select: addressSelect,
        })
        return address ?? null
      })
    },

    async deleteForUser(userId, id) {
      const result = await prisma.address.deleteMany({ where: { id, userId } })
      return result.count > 0
    },
  }
}
