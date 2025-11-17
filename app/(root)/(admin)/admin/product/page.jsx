'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_PRODUCT_COLUMN } from '@/lib/column'
import { columnConfig } from '@/lib/helperFunction'
import { ADMIN_PRODUCT_ADD, ADMIN_DASHBOARD, ADMIN_TRASH } from '@/routes/AdminPanelRoute'
import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

// dynamic import to prevent SSR issues
const DatatableWrapper = dynamic(
  () => import('@/components/Application/Admin/Datatable'),
  {
    ssr: false,
    loading: () => <p>Loading products...</p>
  }
)

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: null, label: 'Products' },
]

const Product = () => {
  // defensive columns computation
  const columns = useMemo(() => {
    return columnConfig(DT_PRODUCT_COLUMN, true, true)
  }, [])

  const action = useCallback((row, deleteType, handleDelete) => {
    // guard against row not having expected structure
    const id = row?.original?._id ?? null
    return [
      <EditAction key="edit" href={id ? `${ADMIN_PRODUCT_ADD}/edit/${id}` : ADMIN_PRODUCT_ADD} />,
      <DeleteAction key="delete" handleDelete={handleDelete} row={row} deleteType={deleteType} />
    ]
  }, [])

  return (
    <div>
      <BreadCrumb breadcrumbData={breadcrumbData} />

      <Card className="py-0 rounded shadow-sm gap-0">
        <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
          <div className="flex justify-between items-center">
            <h4 className='text-xl font-semibold'>Product List</h4>
          </div>
        </CardHeader>
        <CardContent className="px-0 pt-0">
          <DatatableWrapper
            queryKey="product-data"
            fetchUrl="/api/product"
            initialPageSize={10}
            columnsConfig={columns}
            deleteEndpoint="/api/product/delete"
            deleteType="PD"
            trashView={ADMIN_TRASH}
            createAction={action}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default Product