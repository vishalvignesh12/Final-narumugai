import { adminOrderNotification } from '../email/adminOrderNotification.js'
import { orderNotification } from '../email/orderNotification.js'
import { sendMail } from './sendMail.js'

const getOrderUrl = (baseURL, orderId, accessToken) => {
    const url = new URL(`/order-details/${encodeURIComponent(orderId)}`, baseURL)
    if (accessToken) url.searchParams.set('access_token', accessToken)
    return url.toString()
}

export async function sendOrderNotifications({
    order,
    baseURL,
    customerOrderUrl,
    adminEmail = process.env.ADMIN_ORDER_EMAIL?.trim(),
    sendMailFn = sendMail,
    logger = console
}) {
    const notifications = []

    if (order.email) {
        notifications.push({
            recipient: order.email,
            subject: `Order ${order.order_id} confirmed`,
            html: orderNotification({ order_id: order.order_id, orderDetailsUrl: customerOrderUrl })
        })
    }

    if (adminEmail) {
        const orderUrl = new URL(`/admin/orders/details/${encodeURIComponent(order.order_id)}`, baseURL).toString()
        const dashboardUrl = new URL('/admin/orders', baseURL).toString()
        const orderData = typeof order.toObject === 'function' ? order.toObject() : order
        notifications.push({
            recipient: adminEmail,
            subject: `New paid order: ${order.order_id}`,
            html: adminOrderNotification({
                ...orderData,
                adminOrderUrl: orderUrl,
                adminDashboardUrl: dashboardUrl
            })
        })
    } else {
        logger.warn?.(`Admin order notification skipped for ${order.order_id}: ADMIN_ORDER_EMAIL is not configured.`)
    }

    await Promise.all(notifications.map(async ({ recipient, subject, html }) => {
        try {
            const result = await sendMailFn(subject, recipient, html)
            if (!result?.success) {
                logger.error?.(`Order email delivery failed for ${order.order_id} (${recipient}): ${result?.message || 'Unknown mail error'}`)
            }
        } catch (error) {
            logger.error?.(`Order email delivery failed for ${order.order_id} (${recipient}): ${error.message}`)
        }
    }))

    return { attempted: notifications.length }
}

export { getOrderUrl }
