'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import MediaLibraryModal from '@/components/Application/Admin/MediaLibraryModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ADMIN_DASHBOARD, ADMIN_SLIDER_SHOW } from '@/routes/AdminPanelRoute'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { showToast } from '@/lib/showToast'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_SLIDER_SHOW, label: 'Sliders' },
    { href: '', label: 'Add New Slider' },
]

const AddSliderPage = () => {
    const router = useRouter()
    const [formData, setFormData] = useState({
        mediaId: '',
        title: '',
        alt: '',
        link: '',
        order: 0,
        isActive: true
    })
    const [loading, setLoading] = useState(false)
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false)
    const [selectedMedia, setSelectedMedia] = useState(null)

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleMediaSelect = (media) => {
        setSelectedMedia(media)
        setFormData(prev => ({
            ...prev,
            mediaId: media._id
        }))
        setIsMediaLibraryOpen(false)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.mediaId) {
            showToast('error', 'Please select an image for the slider.')
            return
        }
        
        try {
            setLoading(true)
            const response = await axios.post('/api/sliders/create', formData)
            
            if (response.data.success) {
                showToast('success', 'Slider created successfully.')
                router.push(ADMIN_SLIDER_SHOW)
            } else {
                showToast('error', response.data.message || 'Failed to create slider.')
            }
        } catch (error) {
            showToast('error', error.message || 'An error occurred while creating the slider.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className='flex justify-between items-center'>
                        <h4 className='font-semibold text-xl uppercase'>
                            Add New Slider
                        </h4>
                    </div>
                </CardHeader>
                <CardContent className="pb-5">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Label htmlFor="media">Slider Image *</Label>
                                <div className="mt-1">
                                    {selectedMedia ? (
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={selectedMedia.secure_url} 
                                                alt={selectedMedia.alt || 'Selected media'}
                                                className="w-24 h-24 object-cover rounded border"
                                            />
                                            <div>
                                                <p className="font-medium">{selectedMedia.title || 'Untitled'}</p>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => setIsMediaLibraryOpen(true)}
                                                >
                                                    Change Image
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <Button 
                                            type="button" 
                                            variant="outline" 
                                            onClick={() => setIsMediaLibraryOpen(true)}
                                        >
                                            Select Image
                                        </Button>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter slider title"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="alt">Alt Text</Label>
                                <Input
                                    id="alt"
                                    name="alt"
                                    value={formData.alt}
                                    onChange={handleChange}
                                    placeholder="Enter alt text for accessibility"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="link">Link (Optional)</Label>
                                <Input
                                    id="link"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleChange}
                                    placeholder="https://example.com"
                                />
                            </div>
                            
                            <div>
                                <Label htmlFor="order">Display Order</Label>
                                <Input
                                    id="order"
                                    name="order"
                                    type="number"
                                    value={formData.order}
                                    onChange={handleChange}
                                    placeholder="0"
                                />
                            </div>
                            
                            <div className="md:col-span-2">
                                <div className="flex items-center space-x-2">
                                    <input
                                        id="isActive"
                                        name="isActive"
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={handleChange}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <Label htmlFor="isActive">Active</Label>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    Inactive sliders will not be displayed on the website.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" asChild>
                                <Link href={ADMIN_SLIDER_SHOW}>Cancel</Link>
                            </Button>
                            <ButtonLoading 
                                type="submit" 
                                loading={loading} 
                                text="Create Slider" 
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            <MediaLibraryModal
                isOpen={isMediaLibraryOpen}
                onClose={() => setIsMediaLibraryOpen(false)}
                onMediaSelect={handleMediaSelect}
                multiple={false}
            />
        </div>
    )
}

export default AddSliderPage