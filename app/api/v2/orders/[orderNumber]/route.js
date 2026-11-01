import { getOrderRouteHandlers } from '@/src/modules/orders/order-runtime.js'

export async function GET(request, { params }) {
  const { orderNumber } = await params
  return (await getOrderRouteHandlers()).get(request, orderNumber)
}

export async function POST(request, { params }) {
  const { orderNumber } = await params
  return (await getOrderRouteHandlers()).cancel(request, orderNumber)
}
