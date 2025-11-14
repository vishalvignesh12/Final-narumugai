'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
// import DatatableWrapper from '@/components/Application/Admin/DatatableWrapper' // <-- OLD LINE REMOVED
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_BANNER_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperFunction'
import { ADMIN_BANNER_ADD, ADMIN_BANNER_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic' // <-- 1. IMPORT DYNAMIC

// 2. THIS IS THE NEW DYNAMIC IMPORT BLOCK
const DatatableWrapper = dynamic(
    () => import('@/components/Application/Admin/DatatableWrapper'),
    { 
        ssr: false, // <-- This is the fix
        loading: () => <p>Loading banners...</p> // Optional placeholder
    }
)

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_BANNER_SHOW, label: 'Banners' },
]

const Banner = () => {

    const columns = useMemo(() => {
        return columnConfig(DT_BANNER_COLUMN, true, true)
    }, [])

    const action = useCallback((row, deleteType, handleDelete) => {
        return [
            <EditAction key="edit" href={`${ADMIN_BANNER_ADD}/edit/${row.original._id}`} />,
            <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />
        ]
    }, [])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />

            <Card className="py-0 rounded shadow-sm gap-0">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className="flex justify-between items-center">
                        <h4 className='text-xl font-semibold'>Banner List</h4>
                    </div>
                </CardHeader>
                <CardContent className="px-0 pt-0">
                    <DatatableWrapper
                        queryKey="banner-data"
                        fetchUrl="/api/banners/get"
                        initialPageSize={10}
                        columnsConfig={columns}
                        deleteEndpoint="/api/banners/delete"
                        deleteType="SD"
                        createAction={action}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

export default Banner