'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper' // <-- REMOVED
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_COUPON_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperFunction'
import { ADMIN_COUPON_ADD, ADMIN_COUPON_SHOW, ADMIN_DASHBOARD, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic' // <-- ADDED

// <-- ADDED DYNAMIC IMPORT BLOCK -->
const DatatableWrapper = dynamic(
    () => import('@/components/Application/Admin/Datatable'),
    {
        ssr: false,
        loading: () => <p>Loading coupons...</p>
    }
)

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_COUPON_SHOW, label: 'Coupon' },
]

const Coupon = () => {

    const columns = useMemo(() => {
        return columnConfig(DT_COUPON_COLUMN, true, true)
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        return [
            <EditAction key="edit" href={`${ADMIN_COUPON_ADD}/edit/${row.original._id}`} />,
            <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />
        ]
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>Coupon List</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="coupon-data"
                        fetchUrl="/api/coupon"
                        initialPageSize={10}
                        columnsConfig={columns}
                        exportEndpoint="/api/coupon/export"
                        deleteEndpoint="/api/coupon/delete"
                        deleteType="SD"
                        trashView={ADMIN_TRASH}
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default Coupon