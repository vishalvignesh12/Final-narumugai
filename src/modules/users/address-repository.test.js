import assert from 'node:assert/strict'
import test from 'node:test'
import { createAddressRepository } from './address-repository.js'

const userId = '6ac2eb78-59db-440e-93f9-15e599c7fdf2'
const addressId = '95f46ced-8f01-4516-99c7-21e27bd9a2b3'

test('lists only owner addresses with the selected default first', async () => {
  let query
  const repository = createAddressRepository({
    address: { async findMany(args) { query = args; return [] } },
    async $transaction() {},
  })
  await repository.listByUserId(userId)
  assert.deepEqual(query.where, { userId })
  assert.deepEqual(query.orderBy, [{ isDefault: 'desc' }, { createdAt: 'desc' }])
  assert.equal('userId' in query.select, false)
})

test('creates normal addresses directly and switches explicit defaults in a transaction', async () => {
  const calls = []
  const address = {
    async create(args) { calls.push(['create', args]); return args.data },
    async updateMany(args) { calls.push(['updateMany', args]); return { count: 1 } },
  }
  const repository = createAddressRepository({
    address,
    async $transaction(callback) { calls.push(['transaction']); return callback({ address }) },
  })

  await repository.createForUser(userId, { recipientName: 'Customer', isDefault: false })
  assert.deepEqual(calls.map(([name]) => name), ['create'])
  calls.length = 0
  await repository.createForUser(userId, { recipientName: 'Customer', isDefault: true })
  assert.deepEqual(calls.map(([name]) => name), ['transaction', 'updateMany', 'create'])
  assert.deepEqual(calls[1][1].where, { userId, isDefault: true })
})

test('sets defaults only for an address owned by the current user', async () => {
  const calls = []
  const address = {
    async findFirst(args) { calls.push(['findFirst', args]); return { id: addressId } },
    async updateMany(args) { calls.push(['updateMany', args]); return { count: 1 } },
    async updateManyAndReturn(args) { calls.push(['updateManyAndReturn', args]); return [{ id: addressId }] },
  }
  const repository = createAddressRepository({ address, async $transaction(callback) { return callback({ address }) } })
  assert.deepEqual(await repository.updateForUser(userId, addressId, { isDefault: true }), { id: addressId })
  assert.deepEqual(calls[0][1].where, { id: addressId, userId })
  assert.deepEqual(calls[1][1].where, { userId, isDefault: true })
  assert.deepEqual(calls[2][1].where, { id: addressId, userId })

  const missing = { address: { async findFirst() { return null } }, async $transaction(callback) {
    return callback({ address: { async findFirst() { return null } } })
  } }
  assert.equal(await createAddressRepository(missing).updateForUser(userId, addressId, { isDefault: true }), null)
})

test('updates and deletes using both address id and owner id', async () => {
  let updateWhere
  let deleteWhere
  const repository = createAddressRepository({
    address: {
      async updateManyAndReturn(args) { updateWhere = args.where; return [{ id: addressId }] },
      async deleteMany(args) { deleteWhere = args.where; return { count: 1 } },
    },
    async $transaction() {},
  })
  await repository.updateForUser(userId, addressId, { city: 'Chennai' })
  await repository.deleteForUser(userId, addressId)
  assert.deepEqual(updateWhere, { id: addressId, userId })
  assert.deepEqual(deleteWhere, { id: addressId, userId })
})
