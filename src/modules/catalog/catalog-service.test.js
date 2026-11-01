import test from 'node:test'
import assert from 'node:assert/strict'
import { createCatalogService, parseCatalogQuery, CatalogInputError } from './catalog-service.js'

test('catalog query defaults and caps pagination', () => {
  assert.deepEqual(parseCatalogQuery(new URLSearchParams()), {
    page: 1, pageSize: 20, sort: 'newest',
  })
  assert.throws(() => parseCatalogQuery(new URLSearchParams('pageSize=51')), CatalogInputError)
  assert.throws(() => parseCatalogQuery(new URLSearchParams('sort=drop_table')), CatalogInputError)
})

test('catalog service rejects malformed slug before querying', async () => {
  let calls = 0
  const catalog = createCatalogService({ repository: { getProductBySlug: async () => { calls += 1 } } })
  await assert.rejects(catalog.getProductBySlug('../secret'), CatalogInputError)
  assert.equal(calls, 0)
})

test('catalog service passes validated filters to repository', async () => {
  let query
  const catalog = createCatalogService({ repository: { listProducts: async (input) => { query = input; return input } } })
  const result = await catalog.listProducts({ page: 2, pageSize: 10, sort: 'name_asc' })
  assert.equal(result, query)
  assert.deepEqual(query, { page: 2, pageSize: 10, sort: 'name_asc' })
})
