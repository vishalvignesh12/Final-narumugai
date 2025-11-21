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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <Card key={product._id} className={`group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${!product.isAvailable ? 'opacity-80 bg-gray-50 dark:bg-gray-800' : 'bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800'}`}>
                            <CardContent className="p-5">
                                {/* Product Image */}
                                <div className="relative w-full h-52 mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
                                    <CloudinaryImage
                                        src={product.media?.[0]?.secure_url || imgPlaceholder.src}
                                        alt={product.media?.[0]?.alt || product.name}
                                        width={300}
                                        height={200}
                                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                        fallbackSrc={imgPlaceholder.src}
                                    />
                                    {/* Enhanced Availability Badge */}
                                    <div className="absolute top-3 right-3">
                                        <Badge
                                            variant={product.isAvailable ? "default" : "destructive"}
                                            className={`text-xs font-semibold px-3 py-1 shadow-md ${product.isAvailable
                                                ? 'bg-green-500 hover:bg-green-600 text-white'
                                                : 'bg-red-500 hover:bg-red-600 text-white'
                                                }`}
                                        >
                                            {product.isAvailable ? "Available" : "Sold Out"}
                                        </Badge>
                                    </div>

                                    {/* Overlay on hover */}
                                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>

                                {/* Product Info */}
                                <div className="space-y-3 mb-5">
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2 mb-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                                            {product.category}
                                        </p>
                                    </div>

                                    {/* Enhanced Price Display */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                                    ₹{product.sellingPrice?.toLocaleString('en-IN')}
                                                </span>
                                                {product.mrp > product.sellingPrice && (
                                                    <span className="text-sm text-gray-500 line-through">
                                                        ₹{product.mrp?.toLocaleString('en-IN')}
                                                    </span>
                                                )}
                                            </div>
                                            {product.discountPercentage > 0 && (
                                                <Badge variant="secondary" className="text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300">
                                                    {product.discountPercentage}% OFF
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Additional Product Info */}
                                        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                                            <div className="flex justify-between">
                                                <span>SKU:</span>
                                                <span className="font-mono">{product.sku || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Stock:</span>
                                                <span className={`font-semibold ${product.isAvailable
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-red-600 dark:text-red-400'
                                                    }`}>
                                                    {product.isAvailable ? 'In Stock' : 'Out of Stock'}
                                                </span>
                                            </div>
                                        </div>

                                        {!product.isAvailable && product.soldAt && (
                                            <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                                                <span className="font-medium">Sold on:</span> {new Date(product.soldAt).toLocaleDateString()}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Enhanced Action Button */}
                                <ButtonLoading
                                    loading={updatingProduct === product._id}
                                    onClick={() => handleAvailabilityToggle(product._id, product.isAvailable, product.name)}
                                    className={`w-full h-11 font-semibold text-sm rounded-lg transition-all duration-200 ${product.isAvailable
                                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900'
                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-green-200 dark:hover:shadow-green-900'
                                        }`}
                                    disabled={updatingProduct === product._id}
                                >
                                    {product.isAvailable ? (
                                        <>
                                            <TbPackageOff className="mr-2 w-4 h-4" />
                                            Mark as Sold Out
                                        </>
                                    ) : (
                                        <>
                                            <TbPackage className="mr-2 w-4 h-4" />
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