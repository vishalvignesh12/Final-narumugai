// --- 'use client' has been REMOVED. This is now a Server Component. ---
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { Card, CardContent } from '@/components/ui/card'
import dynamic from 'next/dynamic'

// --- FIX: Explicitly import 'default' or 'named' exports ---

// CountOverview uses "export default", so we use .then((mod) => mod.default)
const CountOverview = dynamic(
  () => import('./CountOverview').then((mod) => mod.default),
  { loading: () => <div className="h-[126px] bg-gray-200 rounded-lg animate-pulse"></div> }
)

// We assume all other components are NAMED exports (e.g., "export function OrderOverview")
const OrderOverview = dynamic(
  () => import('./OrderOverview').then((mod) => mod.OrderOverview),
  { loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const OrderStatus = dynamic(
  () => import('./OrderStatus').then((mod) => mod.OrderStatus),
  { loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)

// NOTE: We assume these are also NAMED exports. 
// If they are 'export default', change to .then((mod) => mod.default)
const QuickAdd = dynamic(
  () => import('./QuickAdd').then((mod) => mod.default), // <-- This is CORRECT
  { loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const LatestOrder = dynamic(
  () => import('./LatestOrder').then((mod) => mod.default),
  { loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const LatestReview = dynamic(
  () => import('./LatestReview').then((mod) => mod.default),
  { loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
// --- END OF FIX ---


const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Dashboard' },
]

const Dashboard = () => {

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <div className='mt-5 space-y-5'>

        <CountOverview />

        <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
          <OrderOverview />
          <OrderStatus />
        </div>

        <div className='grid grid-cols-1 xl:grid-cols-3 gap-5'>
          <div className='xl:col-span-1'>
            <QuickAdd />
          </div>
          <div className='xl:col-span-2'>
            <LatestOrder />
          </div>
        </div>

        <div>
          <LatestReview />
        </div>

      </div>
    </div>
  )
}

export default Dashboard