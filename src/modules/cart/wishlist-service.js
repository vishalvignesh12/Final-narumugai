import { z } from 'zod'

export class WishlistValidationError extends Error {}

export function createWishlistService({ repository }) {
  return {
    list(userId) { return repository.list(userId) },
    async add(userId, productId) {
      if (!z.string().uuid().safeParse(userId).success || !z.string().uuid().safeParse(productId).success) {
        throw new WishlistValidationError('Valid user and product IDs are required.')
      }
      return repository.add(userId, productId)
    },
    async remove(userId, productId) {
      if (!z.string().uuid().safeParse(userId).success || !z.string().uuid().safeParse(productId).success) {
        throw new WishlistValidationError('Valid user and product IDs are required.')
      }
      return repository.remove(userId, productId)
    },
  }
}
