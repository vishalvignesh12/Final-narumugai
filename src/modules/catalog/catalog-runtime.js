import prisma from '../../db/prisma.js'
import { createCatalogRepository } from './catalog-repository.js'
import { createCatalogService } from './catalog-service.js'
import { createCatalogRouteHandlers } from './catalog-route-handlers.js'

export const catalogRouteHandlers = createCatalogRouteHandlers({
  catalog: createCatalogService({ repository: createCatalogRepository(prisma) }),
})
