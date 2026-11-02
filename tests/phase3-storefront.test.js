import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

const read = (path) => readFile(new URL(path, import.meta.url), 'utf8')

test('storefront navigation exposes the Kurthi collection', async () => {
    const [navbar, home] = await Promise.all([
        read('../components/Application/Website/NewNavbar.jsx'),
        read('../app/(root)/(website)/page.jsx')
    ])

    assert.match(navbar, /href: '\/categories\/kurthi-materials', label: 'Kurthi Collection'/)
    assert.match(home, /href="\/categories\/kurthi-materials"/)
})

test('Kurthi collection filters resolve category aliases', async () => {
    const [shopRoute, collection] = await Promise.all([
        read('../app/api/shop/route.js'),
        read('../components/Application/Website/KurthiMaterialsCollection.jsx')
    ])

    assert.match(shopRoute, /'kurti', 'kurtis', 'kurthi', 'kurthis'/)
    assert.match(shopRoute, /'kurti-materials', 'kurthi-materials'/)
    assert.match(shopRoute, /'chudi-materials': \{/)
    assert.match(shopRoute, /slug: \{ \$in: group\.slugs \}/)
    assert.match(collection, /const ALL_CATEGORY_SLUGS = \['kurthis', 'gowns', 'chudi-materials'\]/)
    assert.match(collection, /Promise\.all\(ALL_CATEGORY_SLUGS\.map/)
    assert.match(collection, /queryKey: \['kurthi-materials-v2', categoryFilter, page\]/)
    assert.match(collection, /categorySlug: categoryFilter/)
})

test('storefront cards do not present invented ratings or delivery terms', async () => {
    const [home, productCard, details] = await Promise.all([
        read('../app/(root)/(website)/page.jsx'),
        read('../components/Application/Website/ProductBox.jsx'),
        read('../app/(root)/(website)/product/[slug]/ProductDetails.jsx')
    ])

    assert.doesNotMatch(home, /4\.8|thousands of satisfied customers|Free Shipping/)
    assert.doesNotMatch(productCard, /4\.5|Free delivery/)
    assert.doesNotMatch(details, /FREE Delivery|Date\.now\(\) \+ 4/)
    assert.match(details, /\/shipping-policy/)
})

test('product structured data omits fictional reviews and reflects available stock', async () => {
    const productPage = await read('../app/(root)/(website)/product/[slug]/page.jsx')

    assert.doesNotMatch(productPage, /"ratingValue": "4\.5"|"Premium Fabric"|Women's Clothing > Sarees/)
    assert.match(productPage, /https:\/\/schema\.org\/OutOfStock/)
    assert.match(productPage, /https:\/\/schema\.org\/InStock/)
})
