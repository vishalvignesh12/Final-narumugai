let handlersPromise

export function getCartRouteHandlers() {
  handlersPromise ??= Promise.all([
    import('../../db/prisma.js'),
    import('../auth/session-repository.js'),
    import('../auth/session-service.js'),
    import('./cart-repository.js'),
    import('./cart-service.js'),
    import('./wishlist-repository.js'),
    import('./wishlist-service.js'),
    import('./cart-route-handlers.js'),
  ]).then(([{ prisma }, sessionRepository, sessionService, cartRepository, cartService, wishlistRepository, wishlistService, routes]) => {
    return routes.createCartRouteHandlers({
      sessionService: sessionService.createSessionService({ repository: sessionRepository.createSessionRepository(prisma) }),
      cartService: cartService.createCartService({ repository: cartRepository.createCartRepository(prisma) }),
      wishlistService: wishlistService.createWishlistService({ repository: wishlistRepository.createWishlistRepository(prisma) }),
      secure: process.env.NODE_ENV === 'production',
    })
  }).catch((error) => { handlersPromise = null; throw error })
  return handlersPromise
}
