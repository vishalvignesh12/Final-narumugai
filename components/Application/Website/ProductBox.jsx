import React, { useState } from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import WishlistButton from './WishlistButton'
import { IoStar, IoStarOutline } from 'react-icons/io5'
import { FiShoppingCart } from 'react-icons/fi'
import { TbTruck } from 'react-icons/tb'
import { Skeleton } from "@/components/ui/skeleton" // <-- 1. IMPORT SKELETON

const ProductBox = ({ product, showQuickActions = false }) => {
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    
    const handleImageError = () => {
        setImageError(true)
    }

    const discountPercentage = product?.mrp && product?.sellingPrice 
        ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
        : 0

    const renderRating = (rating = 4.5) => {
        const stars = []
        const fullStars = Math.floor(rating)
        const hasHalfStar = rating % 1 !== 0
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<IoStar key={i} className="text-yellow-400 w-3 h-3" />)
            } else {
                stars.push(<IoStarOutline key={i} className="text-gray-300 w-3 h-3" />)
            }
        }
        return stars
    }

    return (
        <Card 
            className={`group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white border-0 shadow-md ${!product?.isAvailable ? 'opacity-75' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-0">
                {/* Image Section */}
                <div className='relative overflow-hidden rounded-t-lg'>
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                        <img
                            src={imageError ? imgPlaceholder.src : (product?.media[0]?.secure_url || imgPlaceholder.src)}
                            width={400}
                            height={400}
                            alt={product?.media[0]?.alt || product?.name}
                            title={product?.media[0]?.title || product?.name}
                            className='w-full xl:h-[280px] lg:h-[260px] md:h-[240px] sm:h-[200px] h-[160px] object-cover transition-transform duration-500 group-hover:scale-110'
                            onError={handleImageError}
                            loading="lazy"
                        />
                    </Link>
                    
                    {/* Overlay with gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-3 right-3 z-10">
                        <WishlistButton 
                            product={product} 
                            className="w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-white transition-all duration-200" 
                            iconSize="w-4 h-4"
                        />
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                        {!product?.isAvailable && (
                            <Badge variant="destructive" className="text-xs font-medium px-2 py-1">
                                Sold Out
                            </Badge>
                        )}
                        {discountPercentage > 0 && product?.isAvailable && (
                            <Badge className="bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-2 py-1">
                                {discountPercentage}% OFF
                            </Badge>
                        )}
                    </div>

                    {/* Quick Action Buttons - Show on hover */}
                    {showQuickActions && isHovered && product?.isAvailable && (
                        <div className="absolute bottom-3 left-3 right-3 flex gap-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <Button size="sm" className="flex-1 h-8 text-xs">
                                <FiShoppingCart className="w-3 h-3 mr-1" />
                                Add to Cart
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 text-xs bg-white/90 backdrop-blur-sm">
                                Quick View
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Content Section */}
                <div className="p-4 space-y-3">
                    {/* Category Badge */}
                    {product?.category?.name && (
                        <div className="mb-2">
                            <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-700 border-gray-200">
                                {product.category.name}
                            </Badge>
                        </div>
                    )}
                    
                    {/* Product Title */}
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                        <h4 className='line-clamp-2 font-semibold text-gray-900 hover:text-primary transition-colors duration-200 leading-tight min-h-[2.5rem]'>
                            {product?.name}
                        </h4>
                    </Link>
                    
                    {/* Rating */}
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                            {renderRating()}
                        </div>
                        <span className="text-xs text-gray-500">(4.5)</span>
                    </div>
                    
                    {/* Price Section */}
                    <div className='flex items-center justify-between'>
                        <div className='flex flex-col gap-1'>
                            <div className='flex items-center gap-2'>
                                <span className='font-bold text-lg text-gray-900'>
                                    {product?.sellingPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </span>
                                {product?.mrp > product?.sellingPrice && (
                                    <span className='line-through text-gray-400 text-sm'>
                                        {product?.mrp?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                )}
                            </div>
                            {product?.isAvailable && (
                                <div className="flex items-center gap-1 text-xs text-green-600">
                                    <TbTruck className="w-3 h-3" />
                                    <span>Free delivery</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// --- 2. CREATE THE SKELETON SUB-COMPONENT ---
const ProductBoxSkeleton = () => {
    return (
        <Card className="bg-white border-0 shadow-md">
            <CardContent className="p-0">
                {/* Image Skeleton */}
                <Skeleton className='w-full xl:h-[280px] lg:h-[260px] md:h-[240px] sm:h-[200px] h-[160px] rounded-t-lg rounded-b-none' />
                
                {/* Content Skeleton */}
                <div className="p-4 space-y-3">
                    {/* Category Skeleton */}
                    <Skeleton className="h-4 w-1/4" />
                    
                    {/* Title Skeleton */}
                    <div className="space-y-2 min-h-[2.5rem]">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    
                    {/* Rating Skeleton */}
                    <Skeleton className="h-3 w-1/3" />
                    
                    {/* Price Skeleton */}
                    <div className='flex items-center justify-between'>
                        <div className='flex flex-col gap-1'>
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// --- 3. ATTACH THE SKELETON TO THE MAIN COMPONENT ---
ProductBox.Skeleton = ProductBoxSkeleton;

export default ProductBox