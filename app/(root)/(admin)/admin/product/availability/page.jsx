'use client'
import React from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import ProductAvailability from '@/components/Application/Admin/ProductAvailability' // <-- OLD LINE REMOVED
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import dynamic from 'next/dynamic' // <-- LINE ADDED

// THIS IS THE BLOCK YOU ADD
const ProductAvailability = dynamic(
  () => import('@/components/Application/Admin/ProductAvailability'),
  { 
    ssr: false, 
    loading: () => <p>Loading availability data...</p> 
  }
)

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Dashboard' },
  { href: '', label: 'Product Availability' },
]

const ProductAvailabilityPage = () => {
  return (
    <div className="space-y-6">
      <BreadCrumb breadcrumbData={breadcrumbData} />
      <ProductAvailability />
    </div>
  )
}

export default ProductAvailabilityPage