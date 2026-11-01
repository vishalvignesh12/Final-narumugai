import test from 'node:test'
import assert from 'node:assert/strict'
import { createWishlistService, WishlistValidationError } from './wishlist-service.js'

test('wishlist is product keyed and validates identity inputs', async () => {
  let added
  const wishlist = createWishlistService({ repository: { add: async (...args) => { added = args; return true } } })
  await assert.rejects(wishlist.add('bad', 'bad'), WishlistValidationError)
  await wishlist.add('ee44f734-6ca5-4010-a108-05e8e161b89d', '4d4cf809-ad78-4894-a74d-81125c36d213')
  assert.equal(added.length, 2)
})
