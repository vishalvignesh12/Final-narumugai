import test from 'node:test'
import assert from 'node:assert/strict'
import { adminOrderNotification } from '../email/adminOrderNotification.js'
import { getOrderUrl, sendOrderNotifications } from '../lib/orderNotifications.js'
import { readFile } from 'node:fs/promises'

const order = {
    order_id: 'order-123',
    transaction_id: 'txn-123',
    name: '<img src=x onerror=alert(1)>',
    email: 'buyer@example.com',
    phone: '9876543210',
    country: 'India',
    state: 'Tamil Nadu',
    city: 'Chennai',
    pincode: '600001',
    landmark: 'Main street',
    products: [{ name: '<script>bad()</script>', size: 'M', color: 'Blue', qty: 1, sellingPrice: 1200 }],
    subtotal: 1200,
    discount: 0,
    couponDiscountAmount: 0,
    totalAmount: 1200,
    ordernote: '<b>leave at door</b>'
}

test('admin notification template escapes customer and item content', () => {
    const html = adminOrderNotification({ ...order, adminOrderUrl: 'https://store.example/admin/orders/details/order-123', adminDashboardUrl: 'https://store.example/admin/orders' })

    assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/)
    assert.match(html, /&lt;script&gt;bad\(\)&lt;\/script&gt;/)
    assert.doesNotMatch(html, /<script>bad\(\)<\/script>/)
    assert.match(html, /New order received/)
})

test('confirmed orders attempt customer and admin emails independently', async () => {
    const sent = []
    const result = await sendOrderNotifications({
        order,
        baseURL: 'https://store.example',
        customerOrderUrl: 'https://store.example/order-details/order-123?access_token=token',
        adminEmail: 'owner@example.com',
        sendMailFn: async (...args) => { sent.push(args); return { success: true } },
        logger: { warn() {}, error() {} }
    })

    assert.equal(result.attempted, 2)
    assert.deepEqual(sent.map(([subject, recipient]) => [subject, recipient]), [
        ['Order order-123 confirmed', 'buyer@example.com'],
        ['New paid order: order-123', 'owner@example.com']
    ])
    assert.match(sent[1][2], /\/admin\/orders\/details\/order-123/)
    assert.match(sent[1][2], /Paid total/)
})

test('email delivery failures are logged and do not escape the notification handler', async () => {
    const errors = []
    const result = await sendOrderNotifications({
        order,
        baseURL: 'https://store.example',
        customerOrderUrl: 'https://store.example/payment-success',
        adminEmail: 'owner@example.com',
        sendMailFn: async (_subject, recipient) => {
            if (recipient === order.email) return { success: false, message: 'SMTP rejected customer message' }
            throw new Error('SMTP unavailable')
        },
        logger: { warn() {}, error: message => errors.push(message) }
    })

    assert.equal(result.attempted, 2)
    assert.equal(errors.length, 2)
    assert.match(errors[0], /SMTP rejected customer message/)
    assert.match(errors[1], /SMTP unavailable/)
})

test('admin notification is skipped cleanly when no recipient is configured', async () => {
    const sent = []
    const warnings = []
    const result = await sendOrderNotifications({
        order,
        baseURL: 'https://store.example',
        customerOrderUrl: 'https://store.example/payment-success',
        adminEmail: '',
        sendMailFn: async (...args) => { sent.push(args); return { success: true } },
        logger: { warn: message => warnings.push(message), error() {} }
    })

    assert.equal(result.attempted, 1)
    assert.equal(sent[0][1], order.email)
    assert.match(warnings[0], /ADMIN_ORDER_EMAIL/)
})

test('payment success route commits before dispatching notifications and keeps the success redirect on email errors', async () => {
    const route = await readFile(new URL('../app/api/payment/verify/route.js', import.meta.url), 'utf8')
    const commitIndex = route.indexOf('await session.commitTransaction()')
    const notificationIndex = route.indexOf('await sendOrderNotifications(')

    assert.ok(commitIndex >= 0 && notificationIndex > commitIndex)
    assert.match(route, /if \(paymentCommitted\)[\s\S]*?payment-success/)
    assert.match(route, /if \(order\.status !== 'pending-payment'\)/)
})

test('customer order links safely encode access tokens', () => {
    const url = getOrderUrl('https://store.example', 'order 123', 'token+value')

    assert.equal(url, 'https://store.example/order-details/order%20123?access_token=token%2Bvalue')
})
