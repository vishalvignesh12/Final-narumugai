import assert from 'node:assert/strict';
import test from 'node:test';
import ProductModel from '../models/Product.model.js';
import ProductVariantModel from '../models/ProductVariant.model.js';
import { isProductInventoryLine } from '../lib/orderInventory.js';
import {
  addCartItemSchema,
  canFitCartQuantity,
  getAvailableVariantQuantity,
  updateCartItemSchema,
} from '../lib/legacyCartContract.js';

const productId = '64b000000000000000000001';
const variantId = '64b000000000000000000002';

test('cart contract validates Mongo IDs and integer quantities', () => {
  assert.deepEqual(addCartItemSchema.parse({ productId, variantId }), { productId, variantId, qty: 1 });
  assert.equal(addCartItemSchema.safeParse({ productId: 'bad', variantId, qty: 1 }).success, false);
  assert.equal(addCartItemSchema.safeParse({ productId, variantId, qty: 1.5 }).success, false);
  assert.equal(updateCartItemSchema.safeParse({ variantId, qty: 21 }).success, false);
});

test('cart quantity is bounded by available variant inventory and product availability', () => {
  const availableVariant = { quantity: 2, product: { isAvailable: true, deletedAt: null } };
  const unavailableVariant = { quantity: 2, product: { isAvailable: false, deletedAt: null } };
  const deletedProductVariant = { quantity: 2, product: { isAvailable: true, deletedAt: new Date() } };

  assert.equal(getAvailableVariantQuantity(availableVariant), 2);
  assert.equal(getAvailableVariantQuantity(unavailableVariant), 0);
  assert.equal(getAvailableVariantQuantity(deletedProductVariant), 0);
  assert.equal(canFitCartQuantity(2, 2), true);
  assert.equal(canFitCartQuantity(3, 2), false);
  assert.equal(canFitCartQuantity(1.5, 2), false);
});

test('Mongo inventory quantities are whole piece counts', () => {
  for (const model of [ProductModel, ProductVariantModel]) {
    const integerValidator = model.schema.path('quantity').validators.find((validator) => validator.type === 'user defined');
    assert.ok(integerValidator);
    assert.equal(integerValidator.validator(1), true);
    assert.equal(integerValidator.validator(1.25), false);
  }
});

test('order lines identify product inventory without fallback ID sentinels', () => {
  assert.equal(isProductInventoryLine({ inventoryType: 'product', variantId: null }), true);
  assert.equal(isProductInventoryLine({ variantId: 'fallback-64b000000000000000000001' }), true);
  assert.equal(isProductInventoryLine({ variantId: null }), true);
  assert.equal(isProductInventoryLine({ inventoryType: 'variant', variantId }), false);
});
