import { z } from 'zod';

const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i);

export const addCartItemSchema = z.object({
    productId: objectIdSchema,
    variantId: objectIdSchema,
    qty: z.number().int().min(1).max(20).default(1),
});

export const updateCartItemSchema = z.object({
    variantId: objectIdSchema,
    qty: z.number().int().min(1).max(20),
});

export const removeCartItemSchema = z.object({ variantId: objectIdSchema });

export function getAvailableVariantQuantity(variant) {
    if (!variant.product?.isAvailable || variant.product.deletedAt) return 0;
    return Math.max(0, variant.quantity || 0);
}

export function canFitCartQuantity(requestedQuantity, availableQuantity) {
    return Number.isInteger(requestedQuantity) && requestedQuantity > 0 &&
        Number.isInteger(availableQuantity) && requestedQuantity <= availableQuantity;
}
