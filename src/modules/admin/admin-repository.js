function normalized(value) { return value.trim().toLocaleLowerCase('en-IN') }

export function createAdminRepository(prisma) {
  return {
    listCategories() { return prisma.category.findMany({ orderBy: { name: 'asc' } }) },
    async createCategory(input, actorId) {
      return prisma.$transaction(async (tx) => {
        const category = await tx.category.create({ data: input })
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'CATEGORY_CREATED', entityType: 'category', entityId: category.id, details: { slug: category.slug } } })
        return category
      })
    },
    async updateCategory(id, input, actorId) {
      return prisma.$transaction(async (tx) => {
        const category = await tx.category.update({ where: { id }, data: input })
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'CATEGORY_UPDATED', entityType: 'category', entityId: id, details: input } })
        return category
      })
    },
    async listProducts(page) {
      return prisma.product.findMany({ include: { category: true, images: true, variants: { include: { inventory: true } } }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 50, take: 50 })
    },
    async createProduct(input, actorId) {
      return prisma.$transaction(async (tx) => {
        const category = await tx.category.findFirst({ where: { id: input.categoryId, status: 'ACTIVE' } })
        if (!category) throw new Error('Category is not available.')
        const product = await tx.product.create({ data: {
          categoryId: input.categoryId, slug: input.slug, name: input.name, description: input.description, featured: input.featured,
        } })
        for (const image of input.images) await tx.productImage.create({ data: { ...image, productId: product.id } })
        const optionTypes = new Map()
        const optionKeys = new Set()
        for (const item of input.variants) {
          const options = [...item.options].map(({ name, value }) => ({ name: normalized(name), value: value.trim(), normalized: normalized(value) })).sort((a, b) => a.name.localeCompare(b.name))
          if (new Set(options.map((option) => option.name)).size !== options.length) throw new Error('Each variant may only set an option once.')
          const optionKey = options.length ? JSON.stringify(options.map(({ name, normalized: value }) => [name, value])) : 'default'
          if (optionKeys.has(optionKey)) throw new Error('Product variants must use different option combinations.')
          optionKeys.add(optionKey)
          const links = []
          for (const option of options) {
            const cacheKey = option.name
            let type = optionTypes.get(cacheKey)
            if (!type) {
              type = await tx.optionType.upsert({
                where: { productId_name: { productId: product.id, name: option.name } },
                create: { productId: product.id, name: option.name }, update: {},
              })
              optionTypes.set(cacheKey, type)
            }
            const value = await tx.optionValue.upsert({
              where: { optionTypeId_normalized: { optionTypeId: type.id, normalized: option.normalized } },
              create: { optionTypeId: type.id, value: option.value, normalized: option.normalized }, update: {},
            })
            links.push({ optionValueId: value.id })
          }
          const variant = await tx.productVariant.create({
            data: {
              productId: product.id, sku: item.sku, optionKey,
              pricePaise: item.pricePaise, compareAtPaise: item.compareAtPaise ?? null,
              optionValues: { create: links },
            },
          })
          await tx.inventory.create({ data: { variantId: variant.id, onHand: item.stock } })
        }
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'PRODUCT_CREATED', entityType: 'product', entityId: product.id, details: { slug: product.slug, variantCount: input.variants.length } } })
        return product
      }, { isolationLevel: 'Serializable' })
    },
    async updateProduct(id, input, actorId) {
      return prisma.$transaction(async (tx) => {
        const product = await tx.product.update({ where: { id }, data: input })
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'PRODUCT_UPDATED', entityType: 'product', entityId: id, details: input } })
        return product
      })
    },
    async adjustInventory(variantId, { onHand, reason }, actorId) {
      if (!/^[0-9a-f-]{36}$/i.test(variantId)) throw new Error('Variant not found.')
      return prisma.$transaction(async (tx) => {
        const inventory = await tx.inventory.findUnique({ where: { variantId } })
        if (!inventory) throw new Error('Inventory not found.')
        if (onHand < inventory.reserved) throw new Error('On-hand inventory cannot be set below the reserved quantity.')
        await tx.inventory.update({ where: { id: inventory.id }, data: { onHand, version: { increment: 1 } } })
        await tx.inventoryMovement.create({ data: { inventoryId: inventory.id, actorUserId: actorId, kind: 'ADJUSTMENT', quantityDelta: onHand - inventory.onHand, reference: reason } })
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'INVENTORY_ADJUSTED', entityType: 'inventory', entityId: inventory.id, details: { from: inventory.onHand, to: onHand, reason } } })
        return { variantId, onHand, reserved: inventory.reserved, available: onHand - inventory.reserved }
      }, { isolationLevel: 'Serializable' })
    },
    listCoupons() { return prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }) },
    async createCoupon(input, actorId) {
      return prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.create({ data: {
          ...input, code: input.code.toUpperCase(), startsAt: input.startsAt ? new Date(input.startsAt) : null,
          expiresAt: input.expiresAt ? new Date(input.expiresAt) : null,
        } })
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'COUPON_CREATED', entityType: 'coupon', entityId: coupon.id, details: { code: coupon.code } } })
        return coupon
      })
    },
    async updateCoupon(id, input, actorId) {
      const data = {
        ...input,
        ...(input.code ? { code: input.code.toUpperCase() } : {}),
        ...(input.startsAt !== undefined ? { startsAt: input.startsAt ? new Date(input.startsAt) : null } : {}),
        ...(input.expiresAt !== undefined ? { expiresAt: input.expiresAt ? new Date(input.expiresAt) : null } : {}),
      }
      return prisma.$transaction(async (tx) => {
        const coupon = await tx.coupon.update({ where: { id }, data })
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'COUPON_UPDATED', entityType: 'coupon', entityId: id, details: { keys: Object.keys(data) } } })
        return coupon
      })
    },
    listOrders(page) {
      return prisma.order.findMany({ include: { items: true, payments: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 50, take: 50 })
    },
    listUsers(page) {
      return prisma.user.findMany({ where: { role: 'CUSTOMER' }, select: { id: true, phone: true, email: true, displayName: true, status: true, createdAt: true, updatedAt: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * 50, take: 50 })
    },
    async updateUserStatus(id, status, actorId) {
      return prisma.$transaction(async (tx) => {
        const result = await tx.user.updateMany({ where: { id, role: 'CUSTOMER' }, data: { status } })
        if (result.count !== 1) throw new Error('Customer not found.')
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'CUSTOMER_STATUS_CHANGED', entityType: 'user', entityId: id, details: { status } } })
        return { id, status }
      })
    },
    async transitionOrder(id, status, actorId, details = {}) {
      return prisma.$transaction(async (tx) => {
        const order = await tx.order.findUnique({ where: { id }, include: { payments: true, items: { include: { variant: { include: { inventory: true } } } } } })
        if (!order) return null
        const allowed = {
          PROCESSING: ['CONFIRMED'],
          SHIPPED: ['PROCESSING'],
          DELIVERED: ['SHIPPED'],
          CANCELLED: ['PAYMENT_FAILED', 'EXPIRED'],
          REFUNDED: ['REFUND_PENDING'],
        }
        if (!allowed[status]?.includes(order.status)) throw new Error(`Cannot transition ${order.status} to ${status}.`)
        if (status === 'REFUNDED') {
          const refund = await tx.payment.updateMany({ where: { orderId: id, status: 'REFUND_PENDING' }, data: { status: 'REFUNDED' } })
          if (refund.count < 1) throw new Error('A pending refund was not found.')
          if (details.restockInventory) {
            for (const item of order.items) {
              if (!item.variant?.inventory) continue
              await tx.inventory.update({ where: { id: item.variant.inventory.id }, data: { onHand: { increment: item.quantity }, version: { increment: 1 } } })
              await tx.inventoryMovement.create({ data: { inventoryId: item.variant.inventory.id, actorUserId: actorId, kind: 'RESTOCKED', quantityDelta: item.quantity, reference: details.refundReference } })
            }
          }
        }
        const updated = await tx.order.update({ where: { id }, data: { status, ...(status === 'CANCELLED' ? { cancellationApprovedBy: actorId, cancellationReason: details.reason || order.cancellationReason } : {}) } })
        await tx.adminAudit.create({ data: { actorUserId: actorId, action: 'ORDER_STATUS_CHANGED', entityType: 'order', entityId: id, details: { from: order.status, to: status, reason: details.reason || null, refundReference: details.refundReference || null, restockInventory: details.restockInventory || false } } })
        return updated
      }, { isolationLevel: 'Serializable' })
    },
  }
}
