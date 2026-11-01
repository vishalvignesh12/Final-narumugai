import { getOrderRouteHandlers } from '@/src/modules/orders/order-runtime.js'

export async function GET(request) { return (await getOrderRouteHandlers()).list(request) }
