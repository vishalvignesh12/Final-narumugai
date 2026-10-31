import { z } from 'zod'

export const checkoutProductSchema = z.object({
  productId: z.string().min(1),
  variantId: z.preprocess((v) => v ?? null, z.string().nullable()),
  name: z.string().min(1),
  qty: z.coerce.number().int().min(1).max(20),
  mrp: z.coerce.number().nonnegative(),
  sellingPrice: z.coerce.number().nonnegative(),
})

export function normalizeCheckoutProducts(raw) {
  return checkoutProductSchema.array().safeParse(raw)
}
