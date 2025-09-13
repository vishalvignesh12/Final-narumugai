'use client'
import BreadCrumb from '@/components/Application/Admin/BreadCrumb'
import ButtonLoading from '@/components/Application/ButtonLoading'
import MediaModal from '@/components/Application/Admin/MediaModal'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ADMIN_DASHBOARD, ADMIN_BANNER_SHOW } from '@/routes/AdminPanelRoute'
import axios from 'axios'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { showToast } from '@/lib/showToast'

const breadcrumbData = [
    { href: ADMIN_DASHBOARD, label: 'Home' },
    { href: ADMIN_BANNER_SHOW, label: 'Banners' },
    { href: '', label: 'Edit Banner' },
]

const EditBannerPage = () => {
    const router = useRouter()
    const params = useParams()
    const bannerId = params.id
    
    const [formData, setFormData] = useState({
        id: bannerId,
        mediaId: '',
        title: '',
        alt: '',
        link: '',
        position: 'homepage-top',
        order: 0,
        isActive: true
    })
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false)
    const [selectedMediaArray, setSelectedMediaArray] = useState([])

    // Fetch banner data
    useEffect(() => {
        const fetchBanner = async () => {
            try {
                setFetching(true)
                const response = await axios.get(`/api/banners/get/${bannerId}`)
                
                if (response.data.success) {
                    const banner = response.data.data
                    setFormData({
                        id: bannerId,
                        mediaId: banner.mediaId?._id || banner.mediaId || '',
                        title: banner.title || '',
                        alt: banner.alt || '',
                        link: banner.link || '',
                        position: banner.position || 'homepage-top',
                        order: banner.order || 0,
                        isActive: banner.isActive !== undefined ? banner.isActive : true
                    })
                    
                    if (banner.mediaId) {
                        setSelectedMediaArray([banner.mediaId])
                    }
                } else {
                    showToast('error', response.data.message || 'Failed to fetch banner data.')
                    router.push(ADMIN_BANNER_SHOW)
                }
            } catch (error) {
                showToast('error', error.message || 'An error occurred while fetching banner data.')
                router.push(ADMIN_BANNER_SHOW)
            } finally {
                setFetching(false)
            }
        }
        
        if (bannerId) {
            fetchBanner()
        }
    }, [bannerId, router])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }))
    }

    const handleSelectChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleMediaSelect = () => {
        if (selectedMediaArray.length > 0) {
            const media = selectedMediaArray[0] // Take first selected media for single selection
            setFormData(prev => ({
                ...prev,
                mediaId: media._id
            }))
            setIsMediaLibraryOpen(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!formData.mediaId) {
            showToast('error', 'Please select an image for the banner.')
            return
        }
        
        try {
            setLoading(true)
            const response = await axios.put('/api/banners/update', formData)
            
            if (response.data.success) {
                showToast('success', 'Banner updated successfully.')
                router.push(ADMIN_BANNER_SHOW)
            } else {
                showToast('error', response.data.message || 'Failed to update banner.')
            }
        } catch (error) {
            showToast('error', error.message || 'An error occurred while updating the banner.')
        } finally {
            setLoading(false)
        }
    }

    if (fetching) {
        return (
            <div>
                <BreadCrumb breadcrumbData={breadcrumbData} />
                <Card className="py-0 rounded shadow-sm">
                    <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                        <h4 className='font-semibold text-xl uppercase'>
                            Edit Banner
                        </h4>
                    </CardHeader>
                    <CardContent className="pb-5">
                        <div className="flex justify-center items-center h-64">
                            <p>Loading banner data...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div>
            <BreadCrumb breadcrumbData={breadcrumbData} />
            <Card className="py-0 rounded shadow-sm">
                <CardHeader className="pt-3 px-3 border-b [.border-b]:pb-2">
                    <div className='flex justify-between items-center'>
                        <h4 className='font-semibold text-xl uppercase'>
                            Edit Banner
                        </h4>
                    </div>
                </CardHeader>
                <CardContent className="pb-5">
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <Label htmlFor="media">Banner Image *</Label>
                                <div className="mt-1">
                                    {selectedMediaArray.length > 0 ? (
                                        <div className="flex items-center gap-4">
                                            <img 
                                                src={selectedMediaArray[0].secure_url} 
                                                alt={selectedMediaArray[0].alt || 'Selected media'}
                                                className="w-24 h-24 object-cover rounded border"
                                            />
                                            <div>
                                                <p className="font-medium">{selectedMediaArray[0].title || 'Untitled'}</p>
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
                                    placeholder="Enter banner title"
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
                                <Label htmlFor="position">Position</Label>
                                <Select 
                                    name="position" 
                                    value={formData.position} 
                                    onValueChange={(value) => handleSelectChange('position', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="homepage-top">Homepage Top</SelectItem>
                                        <SelectItem value="homepage-middle">Homepage Middle</SelectItem>
                                        <SelectItem value="homepage-bottom">Homepage Bottom</SelectItem>
                                        <SelectItem value="header">Header</SelectItem>
                                        <SelectItem value="footer">Footer</SelectItem>
                                        <SelectItem value="sidebar">Sidebar</SelectItem>
                                    </SelectContent>
                                </Select>
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
                                    Inactive banners will not be displayed on the website.
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" asChild>
                                <Link href={ADMIN_BANNER_SHOW}>Cancel</Link>
                            </Button>
                            <ButtonLoading 
                                type="submit" 
                                loading={loading} 
                                text="Update Banner" 
                            />
                        </div>
                    </form>
                </CardContent>
            </Card>
            
            <MediaModal
                open={isMediaLibraryOpen}
                setOpen={setIsMediaLibraryOpen}
                selectedMedia={selectedMediaArray}
                setSelectedMedia={setSelectedMediaArray}
                isMultiple={false}
            />
        </div>
    )
}

export default EditBannerPage