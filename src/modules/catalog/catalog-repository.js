import { Prisma } from '../../generated/prisma/client'

const productInclude = {
  category: { select: { id: true, name: true, slug: true } },
  images: { orderBy: { position: 'asc' } },
  variants: {
    where: { status: 'ACTIVE' },
    orderBy: { sku: 'asc' },
    include: {
      optionValues: {
        include: { optionValue: { include: { optionType: true } } },
      },
      inventory: { select: { onHand: true, reserved: true } },
    },
  },
}

const orderByForSort = {
  newest: [{ createdAt: 'desc' }, { id: 'asc' }],
  name_asc: [{ name: 'asc' }, { id: 'asc' }],
}

export function createCatalogRepository(prisma) {
  return {
    async listProducts({ page, pageSize, category, q, sort, featured }) {
      const where = {
        status: 'ACTIVE',
        ...(category ? { category: { slug: category, status: 'ACTIVE' } } : {}),
        ...(featured ? { featured: featured === 'true' } : {}),
        ...(q ? { OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
        ] } : {}),
      }
      const total = await prisma.product.count({ where })
      let items
      if (sort === 'price_asc' || sort === 'price_desc') {
        const filters = [Prisma.sql`p."status" = 'ACTIVE'::"CatalogStatus" AND c."status" = 'ACTIVE'::"CatalogStatus"`]
        if (category) filters.push(Prisma.sql`c."slug" = ${category}`)
        if (featured) filters.push(Prisma.sql`p."featured" = ${featured === 'true'}`)
        if (q) {
          const escaped = q.replace(/[\\%_]/g, '\\$&')
          filters.push(Prisma.sql`(p."name" ILIKE ${`%${escaped}%`} ESCAPE '\\' OR p."description" ILIKE ${`%${escaped}%`} ESCAPE '\\')`)
        }
        const direction = sort === 'price_asc' ? Prisma.sql`ASC` : Prisma.sql`DESC`
        const ids = await prisma.$queryRaw(Prisma.sql`
          SELECT p."id"
          FROM "products" p
          JOIN "categories" c ON c."id" = p."categoryId"
          LEFT JOIN "product_variants" v ON v."productId" = p."id" AND v."status" = 'ACTIVE'::"CatalogStatus"
          WHERE ${Prisma.join(filters, ' AND ')}
          GROUP BY p."id", p."name"
          ORDER BY MIN(v."pricePaise") ${direction} NULLS LAST, p."name" ASC, p."id" ASC
          LIMIT ${pageSize} OFFSET ${(page - 1) * pageSize}
        `)
        const records = await prisma.product.findMany({ where: { id: { in: ids.map((row) => row.id) } }, include: productInclude })
        const byId = new Map(records.map((record) => [record.id, record]))
        items = ids.map((row) => byId.get(row.id)).filter(Boolean)
      } else {
        items = await prisma.product.findMany({
          where,
          include: productInclude,
          orderBy: orderByForSort[sort],
          skip: (page - 1) * pageSize,
          take: pageSize,
        })
      }
      return { items, total, page, pageSize }
    },

    getProductBySlug(slug) {
      return prisma.product.findFirst({
        where: { slug, status: 'ACTIVE', category: { status: 'ACTIVE' } },
        include: productInclude,
      })
    },

    listCategories() {
      return prisma.category.findMany({
        where: { status: 'ACTIVE' },
        orderBy: [{ name: 'asc' }, { id: 'asc' }],
        select: { id: true, name: true, slug: true },
      })
    },
  }
}

