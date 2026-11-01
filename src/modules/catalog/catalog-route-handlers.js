import { CatalogInputError, parseCatalogQuery } from './catalog-service.js'

function json(data, status = 200) {
  return Response.json(data, { status })
}

export function createCatalogRouteHandlers({ catalog }) {
  return {
    async listProducts(request) {
      try {
        const result = await catalog.listProducts(parseCatalogQuery(new URL(request.url).searchParams))
        return json({ data: result.items, meta: { page: result.page, pageSize: result.pageSize, total: result.total } })
      } catch (error) {
        if (error instanceof CatalogInputError) return json({ error: { code: 'INVALID_QUERY', message: error.message } }, 400)
        return json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to load products.' } }, 500)
      }
    },

    async getProduct(slug) {
      try {
        const product = await catalog.getProductBySlug(slug)
        if (!product) return json({ error: { code: 'NOT_FOUND', message: 'Product not found.' } }, 404)
        return json({ data: product })
      } catch (error) {
        if (error instanceof CatalogInputError) return json({ error: { code: 'INVALID_SLUG', message: error.message } }, 400)
        return json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to load product.' } }, 500)
      }
    },

    async listCategories() {
      try {
        return json({ data: await catalog.listCategories() })
      } catch {
        return json({ error: { code: 'INTERNAL_ERROR', message: 'Unable to load categories.' } }, 500)
      }
    },
  }
}
