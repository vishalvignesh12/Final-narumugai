import { getAdminRouteHandlers } from '@/src/modules/admin/admin-runtime.js'
export async function PATCH(request, { params }) { const { id } = await params; return (await getAdminRouteHandlers()).updateCoupon(request, id) }
