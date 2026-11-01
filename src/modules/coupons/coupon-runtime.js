let handlersPromise
export function getCouponRouteHandlers() {
  handlersPromise ??= Promise.all([
    import('../../db/prisma.js'), import('../auth/session-repository.js'), import('../auth/session-service.js'),
    import('./coupon-repository.js'), import('./coupon-service.js'), import('./coupon-route-handlers.js'),
  ]).then(([{ prisma }, sessionRepository, sessionService, repository, service, handlers]) => handlers.createCouponRouteHandlers({
    sessionService: sessionService.createSessionService({ repository: sessionRepository.createSessionRepository(prisma) }),
    couponService: service.createCouponService({ repository: repository.createCouponRepository(prisma) }),
    secure: process.env.NODE_ENV === 'production',
  })).catch((error) => { handlersPromise = null; throw error })
  return handlersPromise
}
