import { getAdminRouteHandlers } from '@/src/modules/admin/admin-runtime.js'
export async function GET(request) { return (await getAdminRouteHandlers()).listCategories(request) }
export async function POST(request) { return (await getAdminRouteHandlers()).createCategory(request) }
