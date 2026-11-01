import { catalogRouteHandlers } from '@/src/modules/catalog/catalog-runtime.js'

export async function GET(_request, { params }) {
  const { slug } = await params
  return catalogRouteHandlers.getProduct(slug)
}
