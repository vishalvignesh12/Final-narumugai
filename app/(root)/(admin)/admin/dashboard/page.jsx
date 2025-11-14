'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { Card, CardContent } from '@/components/ui/card'
import dynamic from 'next/dynamic' // <-- 1. IMPORT DYNAMIC

// 2. REMOVE ALL STATIC WIDGET IMPORTS
// import CountOverview from './CountOverview'
// import OrderOverview from './OrderOverview'
// import OrderStatus from './OrderStatus'
// import QuickAdd from './QuickAdd'
// import LatestOrder from './LatestOrder'
// import LatestReview from './LatestReview'

// 3. DYNAMICALLY IMPORT ALL WIDGETS
const CountOverview = dynamic(
  () => import('./CountOverview'),
  { ssr: false, loading: () => <div className="h-[126px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const OrderOverview = dynamic(
  () => import('./OrderOverview'),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const OrderStatus = dynamic(
  () => import('./OrderStatus'),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const QuickAdd = dynamic(
  () => import('./QuickAdd'),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const LatestOrder = dynamic(
  () => import('./LatestOrder'),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)
const LatestReview = dynamic(
  () => import('./LatestReview'),
  { ssr: false, loading: () => <div className="h-[400px] bg-gray-200 rounded-lg animate-pulse"></div> }
)


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