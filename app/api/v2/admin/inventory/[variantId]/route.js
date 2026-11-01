import { getAdminRouteHandlers } from '@/src/modules/admin/admin-runtime.js'
export async function PATCH(request, { params }) { const { variantId } = await params; return (await getAdminRouteHandlers()).adjustInventory(request, variantId) }
