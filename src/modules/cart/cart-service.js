import { createHash, randomBytes } from 'node:crypto'
import { z } from 'zod'

const variantIdSchema = z.string().uuid()
const quantitySchema = z.number().int().min(1).max(20)

export function hashGuestCartToken(token) {
  return createHash('sha256').update(token).digest('hex')
}

export function createGuestCartToken() {
  return randomBytes(32).toString('base64url')
}

export class CartValidationError extends Error {}
export class CartItemUnavailableError extends Error {}

export function createCartService({ repository }) {
  if (!repository) throw new TypeError('A cart repository is required.')
  return {
    list(actor) { return repository.list(actor) },
    async setItem(actor, variantId, quantity) {
      if (!variantIdSchema.safeParse(variantId).success || !quantitySchema.safeParse(quantity).success) {
        throw new CartValidationError('A valid variant ID and quantity from 1 to 20 are required.')
      }
      const item = await repository.setItem(actor, variantId, quantity)
      if (!item) throw new CartItemUnavailableError('This product option is no longer available.')
      return item
    },
    async removeItem(actor, variantId) {
      if (!variantIdSchema.safeParse(variantId).success) throw new CartValidationError('Invalid variant ID.')
      await repository.removeItem(actor, variantId)
    },
    async mergeGuestCart(userId, guestTokenHash) {
      if (!z.string().uuid().safeParse(userId).success || !/^[a-f0-9]{64}$/.test(guestTokenHash)) {
        throw new CartValidationError('Invalid cart owner.')
      }
      return repository.mergeGuestCart(userId, guestTokenHash, 20)
    },
  }
}
