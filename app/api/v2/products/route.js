import { catalogRouteHandlers } from '@/src/modules/catalog/catalog-runtime.js'

export const GET = (request) => catalogRouteHandlers.listProducts(request)
