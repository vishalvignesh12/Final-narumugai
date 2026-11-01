import { z } from 'zod'

const cancellationSchema = z.string().trim().min(5).max(500)
export class OrderInputError extends Error {}
export class OrderNotFoundError extends Error {}
export class OrderConflictError extends Error {}

export function createOrderService({ repository }) {
  return {
    async list(actor, page = 1) {
      if (!Number.isInteger(page) || page < 1 || page > 10000) throw new OrderInputError('Invalid page number.')
      return repository.list(actor, page)
    },
    async get(actor, orderNumber) {
      if (typeof orderNumber !== 'string' || !/^NM-[A-Z0-9-]{8,38}$/.test(orderNumber)) throw new OrderInputError('Invalid order number.')
      return repository.get(actor, orderNumber)
    },
    async cancel(actor, orderNumber, reason) {
      const parsed = cancellationSchema.safeParse(reason)
      if (!parsed.success) throw new OrderInputError('Cancellation reason must contain 5 to 500 characters.')
      return repository.requestCancellation(actor, orderNumber, parsed.data)
    },
  }
}
