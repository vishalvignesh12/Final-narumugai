'use client'
import React, { useState, Suspense } from 'react'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import Media from '@/components/Application/Admin/Media' 
import { ADMIN_DASHBOARD, ADMIN_MEDIA_SHOW } from '@/routes/AdminPanelRoute'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import UploadMedia from '@/components/Application/Admin/UploadMedia' // Ensure you have this component imported

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Dashboard' },
    { href: ADMIN_MEDIA_SHOW, label: 'Media' },
]

const MediaPageContent = () => {
    const [selectedMedia, setSelectedMedia] = useState([])
    const queryClient = useQueryClient()

    // 1. Fetch Media Data
    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['media-page'],
        queryFn: async () => {
            const { data } = await axios.get(`/api/media?page=0&limit=10000&deleteType=SD`)
            return data
        }
    })

    // 2. Handle Delete Logic
    const deleteMutation = useMutation({
        mutationFn: async ({ ids, type }) => {
             await axios.post('/api/media/delete', { ids, type })
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['media-page'])
            setSelectedMedia([])
            showToast('success', 'Media deleted successfully')
        },
        onError: (error) => {
             showToast('error', error.response?.data?.message || 'Failed to delete')
        }
    })

    const handleDelete = (ids, type) => {
         deleteMutation.mutate({ ids, type })
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                 {/* Optional: Add your UploadMedia button here if needed */}
                 {/* <UploadMedia /> */}
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10">
                    <p>Loading media...</p>
                </div>
            ) : isError ? (
                <div className="text-red-500 py-10 text-center">
                    Error: {error.message}
                </div>
            ) : (
                <>
                    {data?.mediaData?.length > 0 ? (
                        <div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4'>
                            {data.mediaData.map((mediaItem) => (
                                <Media 
                                    key={mediaItem._id}
                                    media={mediaItem} 
                                    selectedMedia={selectedMedia} 
                                    setSelectedMedia={setSelectedMedia} 
                                    handleDelete={handleDelete} 
                                    deleteType="SD" 
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-gray-500">
                            No media found.
                        </div>
                    )}
                </>
            )}
        </div>
    )
}

const MediaPage = () => {
  return (
    <div>
        <BreadCrumb breadcrumbData={breadcrumbData} />
        {/* Suspense wrapper helps prevent build errors with useSearchParams */}
        <Suspense fallback={<div>Loading page...</div>}>
            <MediaPageContent />
        </Suspense>
    </div>
  )
}

export default MediaPage