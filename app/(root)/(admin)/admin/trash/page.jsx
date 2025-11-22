'use client'
import BreadCrumb from "@/components/Application/Admin/BreadCrumb"
// import DatatableWrapper from "@/components/Application/Admin/DatatableWrapper" // <-- OLD LINE REMOVED
import DeleteAction from "@/components/Application/Admin/DeleteAction"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { DT_BANNER_COLUMN, DT_CATEGORY_COLUMN, DT_COUPON_COLUMN, DT_CUSTOMERS_COLUMN, DT_ORDER_COLUMN, DT_PRODUCT_COLUMN, DT_PRODUCT_VARIANT_COLUMN, DT_REVIEW_COLUMN, DT_SLIDER_COLUMN } from "@/lib/column"
import { columnConfig } from "@/lib/helperFunction"
import { ADMIN_DASHBOARD, ADMIN_TRASH } from "@/routes/AdminPanelRoute"

import { useSearchParams, useRouter } from "next/navigation"
// 1. IMPORT Suspense and dynamic
import { useCallback, useMemo, Suspense } from "react"
import dynamic from 'next/dynamic'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// 2. DYNAMICALLY IMPORT DatatableWrapper (Fixes 'a is not iterable')
const DatatableWrapper = dynamic(
    () => import('@/components/Application/Admin/Datatable'),
    {
        ssr: false,
        loading: () => <p>Loading data...</p>
    }
)

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_TRASH, label: 'Trash' },
]

const TRASH_CONFIG = {
    category: {
        title: 'Category Trash',
        columns: DT_CATEGORY_COLUMN,
        fetchUrl: '/api/category',
        exportUrl: '/api/category/export',
        deleteUrl: '/api/category/delete'
    },

    product: {
        title: 'Product Trash',
        columns: DT_PRODUCT_COLUMN,
        fetchUrl: '/api/product',
        exportUrl: '/api/product/export',
        deleteUrl: '/api/product/delete'
    },
    "product-variant": {
        title: 'Product Variant Trash',
        columns: DT_PRODUCT_VARIANT_COLUMN,
        fetchUrl: '/api/product-variant',
        exportUrl: '/api/product-variant/export',
        deleteUrl: '/api/product-variant/delete'
    },
    coupon: {
        title: 'Coupon Trash',
        columns: DT_COUPON_COLUMN,
        fetchUrl: '/api/coupon',
        exportUrl: '/api/coupon/export',
        deleteUrl: '/api/coupon/delete'
    },
    customers: {
        title: 'Customers Trash',
        columns: DT_CUSTOMERS_COLUMN,
        fetchUrl: '/api/customers',
        exportUrl: '/api/customers/export',
        deleteUrl: '/api/customers/delete'
    },
    review: {
        title: 'Review Trash',
        columns: DT_REVIEW_COLUMN,
        fetchUrl: '/api/review',
        exportUrl: '/api/review/export',
        deleteUrl: '/api/review/delete'
    },
    orders: {
        title: 'Orders Trash',
        columns: DT_ORDER_COLUMN,
        fetchUrl: '/api/orders',
        exportUrl: '/api/orders/export',
        deleteUrl: '/api/orders/delete'
    },
    slider: {
        title: 'Slider Trash',
        columns: DT_SLIDER_COLUMN,
        fetchUrl: '/api/slider',
        exportUrl: '/api/slider/export',
        deleteUrl: '/api/slider/delete'
    },
    banner: {
        title: 'Banner Trash',
        columns: DT_BANNER_COLUMN,
        fetchUrl: '/api/banner',
        exportUrl: '/api/banner/export',
        deleteUrl: '/api/banner/delete'
    },

}

// 3. CREATE AN INNER COMPONENT for all logic
//    This is what will be "suspended"
const TrashContent = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const trashOf = searchParams.get('trashof') || 'category'

    const config = TRASH_CONFIG[trashOf]

    const columns = useMemo(() => {
        if (!config) return []
        return columnConfig(config.columns || [], false, false, true)
    }, [config])

    const action = useCallback((row, deleteType, handleDelete) => {
        return [<DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />]
    }, [])

    const handleTabChange = (value) => {
        router.push(`${ADMIN_TRASH}?trashof=${value}`)
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>Trash Management</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <Tabs value={trashOf} onValueChange={handleTabChange} className="w-full">
                        <div className="px-3 py-2 border-b overflow-x-auto">
                            <TabsList className="h-auto flex-wrap justify-start bg-transparent p-0 gap-2">
                                {Object.entries(TRASH_CONFIG).map(([key, value]) => (
                                    <TabsTrigger
                                        key={key}
                                        value={key}
                                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                    >
                                        {value.title.replace(' Trash', '')}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>

                        {config ? (
                            <DatatableWrapper
                                key={trashOf} // Force re-render on tab change
                                queryKey={`${trashOf}-data-deleted`}
                                fetchUrl={config.fetchUrl}
                                initialPageSize={10}
                                columnsConfig={columns}
                                exportEndpoint={config.exportUrl}
                                deleteEndpoint={config.deleteUrl}
                                deleteType="PD"
                                createAction={action}
                            />
                        ) : (
                            <div className="p-10 text-center text-gray-500">
                                Invalid trash category selected.
                            </div>
                        )}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}

// 4. WRAP THE INNER COMPONENT IN <Suspense>
const Trash = () => {
    return (
        <Suspense fallback={<div>Loading trash...</div>}>
            <TrashContent />
        </Suspense>
    )
}

export default Trash