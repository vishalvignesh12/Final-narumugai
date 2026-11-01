const secure = process.env.NODE_ENV === 'production'
let handlersPromise

export function getAddressRouteHandlers() {
  handlersPromise ??= Promise.all([
    import('../../db/prisma.js'),
    import('../auth/session-repository.js'),
    import('../auth/session-service.js'),
    import('./address-repository.js'),
    import('./address-route-handlers.js'),
    import('./address-service.js'),
  ]).then(([{ prisma }, sessionRepository, sessionService, addressRepository, routeHandlers, addressService]) => {
    return routeHandlers.createAddressRouteHandlers({
      sessionService: sessionService.createSessionService({
        repository: sessionRepository.createSessionRepository(prisma),
      }),
      addressService: addressService.createAddressService({
        repository: addressRepository.createAddressRepository(prisma),
      }),
      secure,
    })
  }).catch((error) => {
    handlersPromise = null
    throw error
  })
  return handlersPromise
}
