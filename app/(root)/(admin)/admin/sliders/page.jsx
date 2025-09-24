'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import useDeleteMutation from '@/hooks/useDeleteMutation'
import { ADMIN_DASHBOARD, ADMIN_SLIDER_SHOW, ADMIN_SLIDER_ADD } from '@/routes/AdminPanelRoute'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: '', label: 'Sliders' },
]

const SlidersPage = () => {
    const queryClient = useQueryClient()
    const [selectedSliders, setSelectedSliders] = useState([])
    const [selectAll, setSelectAll] = useState(false)

    const fetchSliders = async () => {
        const { data: response } = await axios.get(`/api/sliders/get?page=0&limit=1000`)
        return response
    }

    const {
        data,
        error,
        isPending,
        isError
    } = useQuery({
        queryKey: ['sliders-data'],
        queryFn: fetchSliders
    })

    const deleteMutation = useDeleteMutation('sliders-data', '/api/sliders/delete')

    const handleDelete = (ids) => {
        const confirmed = confirm('Are you sure you want to delete the selected sliders?')
        if (confirmed) {
            deleteMutation.mutate({ ids })
            setSelectAll(false)
            setSelectedSliders([])
        }
    }

    const handleSelectAll = () => {
        setSelectAll(!selectAll)
    }

    useEffect(() => {
        if (selectAll) {
            const ids = data?.sliders?.map(slider => slider._id) || [];
            setSelectedSliders(ids)
        } else {
            setSelectedSliders([])
        }
    }, [selectAll, data])

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className='flex justify-between items-center'>
                        <h4 className='font-semibold text-xl uppercase'>
                            Sliders
                        </h4>
                        <div className='flex items-center gap-5'>
                            <Button>
                                <Link href={ADMIN_SLIDER_ADD}>
                                    Add New Slider
                                </Link>
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pb-5">
                    {selectedSliders.length > 0 &&
                        <div className='py-2 px-3 bg-violet-200 mb-2 rounded flex justify-between items-center'>
                            <Label>
                                <Checkbox
                                    checked={selectAll}
                                    onCheckedChange={handleSelectAll}
                                    className="border-primary"
                                />
                                Select All
                            </Label>
                            <Button variant="destructive" onClick={() => handleDelete(selectedSliders)} className="cursor-pointer">
                                Delete Selected
                            </Button>
                        </div>
                    }

                    {isPending ?
                        <div>Loading...</div> :
                        isError ?
                            <div className='text-red-500 text-sm'>
                                {error.message}
                            </div> :
                            <>
                                {data?.sliders?.length === 0 && <div>No sliders found.</div>}
                                <div className='grid grid-cols-1 gap-4 mb-5'>
                                    {
                                        data?.sliders?.map((slider) => (
                                            <div key={slider._id} className="border rounded-lg p-4 flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <Checkbox
                                                        checked={selectedSliders.includes(slider._id)}
                                                        onCheckedChange={(checked) => {
                                                            if (checked) {
                                                                setSelectedSliders([...selectedSliders, slider._id])
                                                            } else {
                                                                setSelectedSliders(selectedSliders.filter(id => id !== slider._id))
                                                            }
                                                        }}
                                                    />
                                                    {slider.mediaId && (
                                                        <img 
                                                            src={slider.mediaId.secure_url} 
                                                            alt={slider.mediaId.alt || slider.title || 'Slider image'}
                                                            className="w-24 h-24 object-cover rounded"
                                                        />
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold">{slider.title || 'Untitled Slider'}</h3>
                                                    <p className="text-sm text-gray-500">{slider.alt || 'No alt text'}</p>
                                                    {slider.link && (
                                                        <p className="text-sm text-blue-500">
                                                            <Link href={slider.link} target="_blank">
                                                                {slider.link}
                                                            </Link>
                                                        </p>
                                                    )}
                                                    <div className="mt-2">
                                                        <span className={`px-2 py-1 rounded text-xs ${slider.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                            {slider.isActive ? 'Active' : 'Inactive'}
                                                        </span>
                                                        <span className="ml-2 px-2 py-1 rounded text-xs bg-gray-100 text-gray-800">
                                                            Order: {slider.order}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button variant="outline" size="sm">
                                                        <Link href={`/admin/sliders/edit/${slider._id}`}>
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

export default SlidersPage