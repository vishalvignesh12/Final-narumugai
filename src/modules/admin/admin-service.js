import { z } from 'zod'

const slug = z.string().trim().min(1).max(180).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
const variantSchema = z.object({
  sku: z.string().trim().min(1).max(80),
  pricePaise: z.number().int().min(0).max(2_000_000_000),
  compareAtPaise: z.number().int().min(0).max(2_000_000_000).optional(),
  stock: z.number().int().min(0).max(1_000_000),
  options: z.array(z.object({ name: z.string().trim().min(1).max(80), value: z.string().trim().min(1).max(120) }).strict()).max(8),
}).strict().refine((v) => v.compareAtPaise == null || v.compareAtPaise >= v.pricePaise)

const productSchema = z.object({
  categoryId: z.string().uuid(),
  slug,
  name: z.string().trim().min(1).max(240),
  description: z.string().max(10000),
  featured: z.boolean().default(false),
  images: z.array(z.object({ url: z.string().url().max(2048), assetId: z.string().max(255).optional(), alt: z.string().max(240).default(''), position: z.number().int().min(0).default(0) }).strict()).max(20),
  variants: z.array(variantSchema).min(1).max(200),
}).strict().superRefine((input, ctx) => {
  if (new Set(input.variants.map((variant) => variant.sku)).size !== input.variants.length) ctx.addIssue({ code: 'custom', message: 'Variant SKUs must be unique within a product.' })
})

const categorySchema = z.object({ name: z.string().trim().min(1).max(120), slug }).strict()
const couponSchema = z.object({
  code: z.string().trim().min(2).max(64).regex(/^[A-Za-z0-9_-]+$/),
  discountKind: z.enum(['PERCENT', 'FIXED']),
  discountValue: z.number().int().min(1),
  minimumSpendPaise: z.number().int().min(0).default(0),
  maximumDiscountPaise: z.number().int().min(0).optional(),
  globalLimit: z.number().int().min(1).optional(),
  perUserLimit: z.number().int().min(1).optional(),
  startsAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
  active: z.boolean().default(true),
}).strict().superRefine((coupon, ctx) => {
  if (coupon.discountKind === 'PERCENT' && coupon.discountValue > 100) ctx.addIssue({ code: 'custom', message: 'Percentage discounts cannot exceed 100.' })
})

export class AdminInputError extends Error {}

function parse(schema, input, message) {
  const result = schema.safeParse(input)
  if (!result.success) throw new AdminInputError(message)
  return result.data
}

export function createAdminService({ repository }) {
  return {
    listCategories: () => repository.listCategories(),
    createCategory: (input, actorId) => repository.createCategory(parse(categorySchema, input, 'Category details are invalid.'), actorId),
    updateCategory: (id, input, actorId) => {
      const parsed = z.object({ name: z.string().trim().min(1).max(120).optional(), slug: slug.optional(), status: z.enum(['ACTIVE', 'ARCHIVED']).optional() }).strict().safeParse(input)
      if (!parsed.success || !Object.keys(parsed.data ?? {}).length) throw new AdminInputError('Category update is invalid.')
      return repository.updateCategory(id, parsed.data, actorId)
    },
    listProducts: (page) => repository.listProducts(page),
    createProduct: (input, actorId) => repository.createProduct(parse(productSchema, input, 'Product details are invalid.'), actorId),
    updateProduct: (id, input, actorId) => {
      const parsed = z.object({ name: z.string().trim().min(1).max(240).optional(), description: z.string().max(10000).optional(), featured: z.boolean().optional(), status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional() }).strict().safeParse(input)
      if (!parsed.success || !Object.keys(parsed.data ?? {}).length) throw new AdminInputError('Product update is invalid.')
      return repository.updateProduct(id, parsed.data, actorId)
    },
    adjustInventory: (variantId, input, actorId) => {
      const parsed = z.object({ onHand: z.number().int().min(0).max(1_000_000), reason: z.string().trim().min(3).max(240) }).strict().safeParse(input)
      if (!parsed.success) throw new AdminInputError('Inventory adjustment is invalid.')
      return repository.adjustInventory(variantId, parsed.data, actorId)
    },
    listCoupons: () => repository.listCoupons(),
    createCoupon: (input, actorId) => repository.createCoupon(parse(couponSchema, input, 'Coupon details are invalid.'), actorId),
    updateCoupon: (id, input, actorId) => repository.updateCoupon(id, parse(couponSchema.partial().strict(), input, 'Coupon update is invalid.'), actorId),
    listOrders: (page) => repository.listOrders(page),
    listUsers: (page) => repository.listUsers(page),
    updateUserStatus: (id, status, actorId) => {
      if (!z.string().uuid().safeParse(id).success || !['ACTIVE', 'SUSPENDED'].includes(status)) throw new AdminInputError('User status update is invalid.')
      return repository.updateUserStatus(id, status, actorId)
    },
    transitionOrder: (id, status, actorId, details = {}) => {
      if (!['PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(status)) throw new AdminInputError('Order status is invalid.')
      if (status === 'REFUNDED' && (details.refundConfirmed !== true || typeof details.refundReference !== 'string' || details.refundReference.trim().length < 3)) {
        throw new AdminInputError('Confirm the completed refund and provide its provider reference.')
      }
      if (details.restockInventory !== undefined && typeof details.restockInventory !== 'boolean') throw new AdminInputError('Restock approval must be boolean.')
      return repository.transitionOrder(id, status, actorId, details)
    },
  }
}
