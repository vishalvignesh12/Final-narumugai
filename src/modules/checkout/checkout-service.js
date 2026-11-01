import { z } from 'zod'

const indiaAddress = z.object({
  recipientName: z.string().trim().min(1).max(120),
  phone: z.string().regex(/^\+91[6-9][0-9]{9}$/),
  line1: z.string().trim().min(1).max(240),
  line2: z.string().trim().max(240).optional().or(z.literal('')),
  landmark: z.string().trim().max(120).optional().or(z.literal('')),
  city: z.string().trim().min(1).max(120),
  state: z.string().trim().min(1).max(120),
  postalCode: z.string().regex(/^[1-9][0-9]{5}$/),
  countryCode: z.literal('IN').default('IN'),
}).strict()

const checkoutSchema = z.object({
  idempotencyKey: z.string().trim().min(12).max(128),
  addressId: z.string().uuid().optional(),
  address: indiaAddress.optional(),
  contactName: z.string().trim().min(1).max(120),
  contactPhone: z.string().regex(/^\+91[6-9][0-9]{9}$/),
  contactEmail: z.string().email().max(320).optional(),
  couponCode: z.string().trim().max(64).optional(),
}).strict().superRefine((value, context) => {
  if (Boolean(value.addressId) === Boolean(value.address)) {
    context.addIssue({ code: 'custom', message: 'Provide exactly one saved address ID or shipping address.' })
  }
})

export class CheckoutValidationError extends Error {}
export class CheckoutConflictError extends Error {}
export class CheckoutNotFoundError extends Error {}

export function createCheckoutService({ repository, now = () => new Date() }) {
  return {
    async checkout(actor, input) {
      const parsed = checkoutSchema.safeParse(input)
      if (!parsed.success) throw new CheckoutValidationError('Checkout details are invalid.')
      if (actor.userId && !parsed.data.addressId) throw new CheckoutValidationError('Select a saved address.')
      if (!actor.userId && !parsed.data.address) throw new CheckoutValidationError('Enter a shipping address.')
      if (!actor.userId && !actor.guestTokenHash) throw new CheckoutValidationError('Guest cart is unavailable.')
      return repository.createCheckout(actor, parsed.data, { now: now(), reservationDurationMs: 10 * 60 * 1000 })
    },
  }
}
