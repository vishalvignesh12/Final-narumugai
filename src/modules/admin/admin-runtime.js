let handlersPromise
export function getAdminRouteHandlers() {
  handlersPromise ??= Promise.all([
    import('../../db/prisma.js'), import('../auth/session-repository.js'), import('../auth/session-service.js'),
    import('./admin-repository.js'), import('./admin-service.js'), import('./admin-route-handlers.js'),
  ]).then(([{ prisma }, sessionRepository, sessionService, repository, service, handlers]) => handlers.createAdminRouteHandlers({
    sessionService: sessionService.createSessionService({ repository: sessionRepository.createSessionRepository(prisma) }),
    adminService: service.createAdminService({ repository: repository.createAdminRepository(prisma) }),
    secure: process.env.NODE_ENV === 'production',
  })).catch((error) => { handlersPromise = null; throw error })
  return handlersPromise
}
