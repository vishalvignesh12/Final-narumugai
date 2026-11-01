let handlersPromise
export function getOrderRouteHandlers() {
  handlersPromise ??= Promise.all([
    import('../../db/prisma.js'), import('../auth/session-repository.js'), import('../auth/session-service.js'),
    import('./order-repository.js'), import('./order-service.js'), import('./order-route-handlers.js'),
  ]).then(([{ prisma }, sessionRepository, sessionService, repository, service, handlers]) => handlers.createOrderRouteHandlers({
    sessionService: sessionService.createSessionService({ repository: sessionRepository.createSessionRepository(prisma) }),
    orderService: service.createOrderService({ repository: repository.createOrderRepository(prisma) }),
    secure: process.env.NODE_ENV === 'production',
  })).catch((error) => { handlersPromise = null; throw error })
  return handlersPromise
}
