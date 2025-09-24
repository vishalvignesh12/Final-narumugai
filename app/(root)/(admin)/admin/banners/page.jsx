'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import useDeleteMutation from '@/hooks/useDeleteMutation'
import { ADMIN_DASHBOARD, ADMIN_BANNER_SHOW, ADMIN_BANNER_ADD } from '@/routes/AdminPanelRoute'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
import { useEffect, useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Banners' },
]

const BannersPage = () => {
    const queryClient = useQueryClient()
    const [selectedBanners, setSelectedBanners] = useState([])
    const [selectAll, setSelectAll] = useState(false)

    const fetchBanners = async () => {
        const { data: response } = await axios.get('/api/banners/get?page=0&limit=10000')
        return {
            banners: response.data.banners || [],
            totalCount: response.data.totalCount || 0
        }
    }

    const {
        data,
        error,
        isLoading,
        status
    } = useQuery({
        queryKey: ['banners-data'],
        queryFn: fetchBanners,
    })

    const deleteMutation = useDeleteMutation('banners-data', '/api/banners/delete')

    const handleDelete = (ids) => {
        const confirmed = confirm('Are you sure you want to delete the selected banners?')
        if (confirmed) {
            deleteMutation.mutate({ ids })
            setSelectAll(false)
            setSelectedBanners([])
        }
    }

    const handleSelectAll = () => {
        setSelectAll(!selectAll)
    }

    useEffect(() => {
        if (selectAll) {
            const ids = data?.banners?.map(banner => banner._id) || [];
            setSelectedBanners(ids)
        } else {
            setSelectedBanners([])
        }
    }, [selectAll, data])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className='flex justify-between items-center'>
                        <h4 className='font-semibold text-xl uppercase'>
                            Banners
                        </h4>
                        <div className='flex items-center gap-5'>
                            <Button>
                                <Link href={ADMIN_BANNER_ADD}>
                                    Add New Banner
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-5">
                    {selectedBanners.length > 0 &&
                        <div className='py-2 px-3 bg-violet-200 mb-2 rounded flex justify-between items-center'>
                            <Label>
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={handleSelectAll}
                                    className="border-primary"
                                />
                                Select All
                            </Label>
                            <Button variant="destructive" onClick={() => handleDelete(selectedBanners)} className="cursor-pointer">
                                Delete Selected
                            </Button>
                        </div>
                    }

                    {status === 'pending' || isLoading ?
                        <div>Loading...</div> :
                        status === 'error' ?
                            <div className='text-red-500 text-sm'>
                                {error.message}
                            </div> :
                            <>
                                {data?.banners?.length === 0 && <div>No banners found.</div>}
                                <div className='grid grid-cols-1 gap-4 mb-5'>
                                    {
                                        data?.banners?.map((banner) => (
                                            <div key={banner._id} className="border rounded-lg p-4 flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={selectedBanners.includes(banner._id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedBanners([...selectedBanners, banner._id])
                                                            } else {
                                                                setSelectedBanners(selectedBanners.filter(id => id !== banner._id))
                                                            }
                                                        }}
                                                    />
                                                    {banner.mediaId ? (
                                                        <img 
                                                            src={banner.mediaId.secure_url} 
                                                            alt={banner.mediaId.alt || banner.title || 'Banner image'}
                                                            className="w-24 h-24 object-cover rounded"
                                                        />
                                                    ) : (
                                                        <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{banner.title || 'Untitled Banner'}</h3>
                                                    <p className="text-sm text-gray-500">{banner.alt || 'No alt text'}</p>
                                                    {banner.link && (
                                                        <p className="text-sm text-blue-500">
                                                            <Link href={banner.link} target="_blank">
                                                                {banner.link}
                                                            </Link>
                                                        </p>
                                                    )}
                                                    <div className="mt-2">
                                                        <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                                            Position: {banner.position}
                                                        </span>
                                                        <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                                            Order: {banner.order}
                                                        </span>
                                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${banner.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {banner.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span className={`ml-2 px-2 py-1 rounded text-xs ${banner.mediaId ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                                                            Media: {banner.mediaId ? 'Connected' : 'Missing'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        <Link href={`/admin/banners/edit/${banner._id}`}>
                                                            Edit
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    }
                                </div>
                            </>
                    }


                </CardContent>
            </Card>
        </div>
    )
}

export default BannersPage