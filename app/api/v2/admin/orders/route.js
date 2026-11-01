import { getAdminRouteHandlers } from '@/src/modules/admin/admin-runtime.js'
export async function GET(request) { return (await getAdminRouteHandlers()).listOrders(request) }
