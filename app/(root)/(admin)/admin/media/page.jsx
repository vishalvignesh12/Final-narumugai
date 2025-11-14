'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import Media from '@/components/Application/Admin/Media' // <-- OLD LINE REMOVED
import { ADMIN_DASHBOARD, ADMIN_MEDIA } from '@/routes/AdminPanelRoute'
import React, { Suspense } from 'react' // <-- Suspense is still needed
import dynamic from 'next/dynamic' // <-- 1. IMPORT DYNAMIC

// 2. DYNAMICALLY IMPORT THE MEDIA COMPONENT
const Media = dynamic(
  () => import('@/components/Application/Admin/Media'),
  { 
    ssr: false, // <-- This stops the 'includes' error
    loading: () => <div>Loading media...</div> 
  }
)

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Dashboard' },
    { href: ADMIN_MEDIA, label: 'Media' },
]

const MediaPage = () => {
  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData} />
        {/* 3. KEEP THE SUSPENSE WRAPPER for useSearchParams */}
        <Suspense fallback={<div>Loading media...</div>}>
            <Media /> 
        </Suspense>
    </div>
  )
}

export default MediaPage