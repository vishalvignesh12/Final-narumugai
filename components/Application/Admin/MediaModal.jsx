import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import Image from 'next/image'
import React, { useState } from 'react'
import ModalMediaBlock from './ModalMediaBlock'
import { showToast } from '@/lib/showToast'
const MediaModal = ({ open, setOpen, selectedMedia, setSelectedMedia, isMultiple }) => {

    const [previouslySelected, setPreviouslySelected] = useState([])

    const fetchMedia = async () => {
        try {
            const { data: response } = await axios.get(`/api/media?page=0&limit=10000&deleteType=SD`)
            return response
        } catch (error) {
            console.error('Failed to fetch media:', error)
            throw new Error('Failed to load media files')
        }
    }

    const { isPending, isError, error, data } = useQuery({
        queryKey: ['MediaModal'],
        queryFn: fetchMedia
    })


    const handleClear = () => {
        setSelectedMedia([])
        setPreviouslySelected([])
        showToast('success', 'Media selection cleared.')
    }
    const handleClose = () => {
        setSelectedMedia(previouslySelected)
        setOpen(false)
    }
    const handleSelect = () => {
        if (selectedMedia.length <= 0) {
            return showToast('error', 'Please select a media.')
        }

        setPreviouslySelected(selectedMedia)
        setOpen(false)
    }

    return (
        <Dialog
            open={open}
            onOpenChange={() => setOpen(!open)}
        >
            <DialogContent onInteractOutside={(e) => e.preventDefault()}
                className="sm:max-w-[80%] h-screen p-0 py-10 bg-transparent border-0 shadow-none"
            >
                <DialogDescription className="hidden"></DialogDescription>

                <div className='h-[90vh] bg-white dark:bg-card p-3 rounded shadow'>
                    <DialogHeader className="h-8 border-b">
                        <DialogTitle>Media Selection</DialogTitle>
                    </DialogHeader>

                    <div className='h-[calc(100%-80px)] overflow-auto py-2'>
                        {isPending ?
                            (<div className='size-full flex justify-center items-center'>
                                <img src="/assets/images/loading.svg" width="80" height="80" alt='loading' />
                            </div>)
                            :
                            isError ?
                                <div className='size-full flex justify-center items-center'>
                                    <span className='text-red-500'>{error.message}</span>
                                </div>
                                :
                                <>  
                                    <div className='grid lg:grid-cols-6 grid-cols-3 gap-2'>
                                        {
                                            data?.mediaData?.filter(media => media && media._id && media.secure_url).map((media) => (
                                                <ModalMediaBlock
                                                    key={media._id}
                                                    media={media}
                                                    selectedMedia={selectedMedia}
                                                    setSelectedMedia={setSelectedMedia}
                                                    isMultiple={isMultiple}
                                                />
                                            ))
                                        }
                                    </div>

                                    {(!data?.mediaData || data?.mediaData?.length === 0) && (
                                        <p className='text-center py-5'>No media found.</p>
                                    )}
                                </>
                        }
                    </div>


                    <div className='h-10 pt-3 border-t flex justify-between'>
                        <div>
                            <Button type="button" variant="destructive" onClick={handleClear} >
                                Clear All
                            </Button>
                        </div>
                        <div className='flex gap-5'>
                            <Button type="button" variant="secondary" onClick={handleClose} >
                                Close
                            </Button>
                            <Button type="button" onClick={handleSelect} >
                                Select
                            </Button>
                        </div>
                    </div>

                </div>

            </DialogContent>
        </Dialog>
    )
}

export default MediaModal