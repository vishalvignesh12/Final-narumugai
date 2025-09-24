'use client'
import React from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ProductAvailability from '@/components/Application/Admin/ProductAvailability'
import { ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'

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