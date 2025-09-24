'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import CloudinaryImage from '@/components/CloudinaryImage'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { showToast } from '@/lib/showToast'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import notFound from '@/public/assets/images/not-found.png'
import { IoSearch } from "react-icons/io5"
import { TbPackageOff } from "react-icons/tb"
import { TbPackage } from "react-icons/tb"
import ButtonLoading from '@/components/Application/ButtonLoading'

const ProductAvailability = () => {
    const [search, setSearch] = useState('')
    const [updatingProduct, setUpdatingProduct] = useState(null)
    const queryClient = useQueryClient()

    // Fetch ALL products with availability status (no pagination)
    const fetchProducts = async () => {
        try {
            const { data: response } = await axios.get(`/api/product/availability?page=0&limit=10000&search=${search}`)
            return response
        } catch (error) {
            console.error('Failed to fetch products:', error)
            throw new Error('Failed to load products')
        }
    }

    const { data, isPending, isError, error } = useQuery({
        queryKey: ['product-availability', search],
        queryFn: fetchProducts,
        keepPreviousData: true
    })

    // Handle availability toggle
    const handleAvailabilityToggle = async (productId, currentStatus, productName) => {
        setUpdatingProduct(productId)
        try {
            const newStatus = !currentStatus
            const { data: response } = await axios.patch('/api/product/availability', {
                productId,
                isAvailable: newStatus
            })

            if (response.success) {
                showToast('success', response.message)
                // Invalidate and refetch the query
                queryClient.invalidateQueries(['product-availability'])
            } else {
                throw new Error(response.message)
            }
        } catch (error) {
            showToast('error', error.response?.data?.message || error.message)
        } finally {
            setUpdatingProduct(null)
        }
    }

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            // Just trigger refetch when search changes
        }, 500)
        return () => clearTimeout(timeoutId)
    }, [search])

    const products = data?.data || []
    const meta = data?.meta || {}

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                <TbPackageOff className="text-6xl text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Failed to load products</h3>
                <p className="text-gray-500">{error?.message}</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Product Availability</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage physical store inventory</p>
                </div>
                
                {/* Search */}
                <div className="relative w-full sm:w-80">
                    <Input
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10"
                    />
                    <IoSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TbPackage className="text-green-500 text-2xl" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Available</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {products.filter(p => p.isAvailable).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TbPackageOff className="text-red-500 text-2xl" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Sold Out</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {products.filter(p => !p.isAvailable).length}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center space-x-2">
                            <TbPackage className="text-blue-500 text-2xl" />
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Products</p>
                                <p className="text-2xl font-bold text-blue-600">{meta.totalProducts || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Product Grid */}
            {isPending ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[...Array(8)].map((_, index) => (
                        <Card key={index} className="animate-pulse">
                            <CardContent className="p-4">
                                <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                                <div className="h-10 bg-gray-200 rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : products.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
                    <CloudinaryImage 
                        src={notFound.src} 
                        width={80} 
                        height={80} 
                        alt="not found" 
                        className="mb-4" 
                    />
                    <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
                    <p className="text-gray-500">
                        {search ? 'Try adjusting your search terms' : 'No products available in the inventory'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product._id} className={`transition-all duration-200 hover:shadow-lg ${!product.isAvailable ? 'opacity-75' : ''}`}>
                            <CardContent className="p-4">
                                {/* Product Image */}
                                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gray-100">
                                    <CloudinaryImage
                                        src={product.media?.[0]?.secure_url || imgPlaceholder.src}
                                        alt={product.media?.[0]?.alt || product.name}
                                        width={300}
                                        height={200}
                                        className="object-cover w-full h-full"
                                        fallbackSrc={imgPlaceholder.src}
                                    />
                                    {/* Availability Badge */}
                                    <div className="absolute top-2 right-2">
                                        <Badge variant={product.isAvailable ? "default" : "destructive"}>
                                            {product.isAvailable ? "Available" : "Sold Out"}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Product Info */}
                                <div className="space-y-2 mb-4">
                                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                                        {product.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        {product.category}
                                    </p>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-lg font-bold text-green-600">
                                            ₹{product.sellingPrice}
                                        </span>
                                        {product.mrp > product.sellingPrice && (
                                            <span className="text-sm text-gray-500 line-through">
                                                ₹{product.mrp}
                                            </span>
                                        )}
                                        {product.discountPercentage > 0 && (
                                            <Badge variant="secondary" className="text-xs">
                                                {product.discountPercentage}% OFF
                                            </Badge>
                                        )}
                                    </div>
                                    {!product.isAvailable && product.soldAt && (
                                        <p className="text-xs text-gray-500">
                                            Sold on: {new Date(product.soldAt).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>

                                {/* Action Button */}
                                <ButtonLoading
                                    loading={updatingProduct === product._id}
                                    onClick={() => handleAvailabilityToggle(product._id, product.isAvailable, product.name)}
                                    className={`w-full ${
                                        product.isAvailable 
                                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                                            : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                                    disabled={updatingProduct === product._id}
                                >
                                    {product.isAvailable ? (
                                        <>
                                            <TbPackageOff className="mr-2" />
                                            Mark as Sold Out
                                        </>
                                    ) : (
                                        <>
                                            <TbPackage className="mr-2" />
                                            Mark as Available
                                        </>
                                    )}
                                </ButtonLoading>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ProductAvailability