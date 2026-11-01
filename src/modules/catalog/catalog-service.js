import { z } from 'zod'

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(20),
  category: z.string().trim().min(1).max(160).optional(),
  q: z.string().trim().max(120).optional(),
  sort: z.enum(['newest', 'price_asc', 'price_desc', 'name_asc']).default('newest'),
  featured: z.enum(['true', 'false']).optional(),
})

export class CatalogInputError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CatalogInputError'
  }
}

export function parseCatalogQuery(params) {
  const parsed = listQuerySchema.safeParse(Object.fromEntries(params.entries()))
  if (!parsed.success) throw new CatalogInputError('Invalid catalog query.')
  return parsed.data
}

export function createCatalogService({ repository }) {
  if (!repository) throw new TypeError('A catalog repository is required.')

  return {
    async listProducts(query) {
      const parsed = listQuerySchema.safeParse(query)
      if (!parsed.success) throw new CatalogInputError('Invalid catalog query.')
      return repository.listProducts(parsed.data)
    },

    async getProductBySlug(slug) {
      if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
        throw new CatalogInputError('Invalid product slug.')
      }
      return repository.getProductBySlug(slug)
    },

    async listCategories() {
      return repository.listCategories()
    },
  }
}
