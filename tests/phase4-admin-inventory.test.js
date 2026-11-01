import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('admin availability requests a bounded page and debounces search', async () => {
    const [screen, route] = await Promise.all([
        read('../components/Application/Admin/ProductAvailability.jsx'),
        read('../app/api/product/availability/route.js')
    ])

    assert.match(screen, /limit: '20'/)
    assert.match(screen, /setDebouncedSearch\(search\.trim\(\)\)/)
    assert.match(screen, /Page \{page \+ 1\} of/)
    assert.doesNotMatch(screen, /limit=10000/)
    assert.match(route, /MAX_PAGE_SIZE = 100/)
    assert.match(route, /Math\.min\(requestedLimit, MAX_PAGE_SIZE\)/)
})

test('availability is derived from remaining stock for products and size variants', async () => {
    const route = await read('../app/api/product/availability/route.js')

    assert.match(route, /cond: \{ \$gt: \['\$\$variant\.quantity', 0\] \}/)
    assert.match(route, /\{ \$and: \['\$isAvailable', \{ \$gt: \['\$quantity', 0\] \}\] \}/)
    assert.match(route, /variant\.quantity = isAvailable \? 1 : 0/)
    assert.match(route, /isAvailable: availableVariants > 0/)
})

test('admin availability mutations validate identifiers and reject deleted products', async () => {
    const route = await read('../app/api/product/availability/route.js')

    assert.match(route, /mongoose\.isValidObjectId\(variantId\)/)
    assert.match(route, /mongoose\.isValidObjectId\(productId\)/)
    assert.match(route, /findOne\(\{ _id: productId, deletedAt: null \}\)/)
})
