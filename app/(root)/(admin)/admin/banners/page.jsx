'use client'

import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import DeleteAction from '@/components/Application/Admin/DeleteAction'
import EditAction from '@/components/Application/Admin/EditAction'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { DT_BANNER_COLUMN } from '@/lib/column'
import { columnConfig as columnConfigOriginal } from '@/lib/helperFunction'
import { ADMIN_BANNER_ADD, ADMIN_BANNER_SHOW, ADMIN_DASHBOARD } from '@/routes/AdminPanelRoute'
import { useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'

// dynamic import remains
const DatatableWrapper = dynamic(
  () => import('@/components/Application/Admin/DatatableWrapper'),
  {
    ssr: false,
    loading: () => <p>Loading banners...</p>
  }
)

const breadcrumbData = [
  { href: ADMIN_DASHBOARD, label: 'Home' },
  { href: ADMIN_BANNER_SHOW, label: 'Banners' },
]

// Defensive wrapper for columnConfig
function safeColumnConfig(columnsArg, ...rest) {
  try {
    // normalize columnsArg to an array or empty array
    const safeColumns = Array.isArray(columnsArg) ? columnsArg : (columnsArg ? Object.values(columnsArg) : [])
    // ensure columnConfigOriginal exists
    if (typeof columnConfigOriginal === 'function') {
      return columnConfigOriginal(safeColumns, ...rest)
    }
    // fallback: return empty array config shape that DatatableWrapper expects
    return []
  } catch (err) {
    // Return a safe default instead of throwing during build/prerender
    // Also log a minimal message so source map stack traces will include this file
    // (avoid logging entire objects which can be noisy)
    // eslint-disable-next-line no-console
    console.error('[Banner] safeColumnConfig failed:', err && err.message)
    return []
  }
}

const Banner = () => {
  // defensive columns computation
  const columns = useMemo(() => {
    // Quick non-throwing attempt + minimal logging to help trace
    try {
      // small debug: log types so server build logs can show which value shape caused issues
      // eslint-disable-next-line no-console
      console.log('[Banner] DT_BANNER_COLUMN type:', typeof DT_BANNER_COLUMN, 'isArray:', Array.isArray(DT_BANNER_COLUMN))
      return safeColumnConfig(DT_BANNER_COLUMN, true, true)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[Banner] columns useMemo error:', err && err.message)
      return []
    }
  }, [])

  const action = useCallback((row, deleteType, handleDelete) => {
    // guard against row not having expected structure
    const id = row?.original?._id ?? null
    return [
      <EditAction key="edit" href={id ? `${ADMIN_BANNER_ADD}/edit/${id}` : ADMIN_BANNER_ADD} />,
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
