import React, { useState } from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import WishlistButton from './WishlistButton'
import { IoStar, IoStarOutline, IoEyeOutline } from 'react-icons/io5'
import { FiShoppingCart, FiHeart } from 'react-icons/fi'
import { TbTruck, TbShoppingBagPlus } from 'react-icons/tb'
import { cn } from '@/lib/utils'

const ProductCard = ({ 
    product, 
    showQuickActions = true, 
    variant = 'default', // 'default', 'compact', 'featured'
    className = ''
}) => {
    const [imageError, setImageError] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [imageLoading, setImageLoading] = useState(true)
    
    const handleImageError = () => {
        setImageError(true)
        setImageLoading(false)
    }

    const handleImageLoad = () => {
        setImageLoading(false)
    }

    const discountPercentage = product?.mrp && product?.sellingPrice 
        ? Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100)
        : 0

    const renderRating = (rating = 4.5) => {
        const stars = []
        const fullStars = Math.floor(rating)
        
        for (let i = 0; i < 5; i++) {
            if (i < fullStars) {
                stars.push(<IoStar key={i} className="text-amber-400 w-3.5 h-3.5" />)
            } else {
                stars.push(<IoStarOutline key={i} className="text-gray-300 w-3.5 h-3.5" />)
            }
        }
        return stars
    }

    const getImageHeight = () => {
        switch (variant) {
            case 'compact':
                return 'xl:h-[220px] lg:h-[200px] md:h-[180px] sm:h-[160px] h-[140px]'
            case 'featured':
                return 'xl:h-[320px] lg:h-[300px] md:h-[280px] sm:h-[240px] h-[200px]'
            default:
                return 'xl:h-[280px] lg:h-[260px] md:h-[240px] sm:h-[200px] h-[160px]'
        }
    }

    const cardVariants = {
        default: 'hover:shadow-2xl hover:-translate-y-2',
        compact: 'hover:shadow-lg hover:-translate-y-1',
        featured: 'hover:shadow-2xl hover:-translate-y-3 shadow-lg'
    }

    return (
        <Card 
            className={cn(
                `group cursor-pointer transition-all duration-500 bg-white border border-gray-100 shadow-sm overflow-hidden ${cardVariants[variant]} ${!product?.isAvailable ? 'opacity-75' : ''}`,
                className
            )}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <CardContent className="p-0">
                {/* Image Section */}
                <div className='relative overflow-hidden bg-gray-50'>
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                        {/* Loading Skeleton */}
                        {imageLoading && (
                            <div className={`animate-pulse bg-gray-200 w-full ${getImageHeight()}`} />
                        )}
                        
                        <img
                            src={imageError ? imgPlaceholder.src : (product?.media[0]?.secure_url || imgPlaceholder.src)}
                            width={400}
                            height={400}
                            alt={product?.media[0]?.alt || product?.name}
                            title={product?.media[0]?.title || product?.name}
                            className={cn(
                                `w-full object-cover transition-all duration-700 ease-out ${getImageHeight()}`,
                                imageLoading ? 'opacity-0' : 'opacity-100',
                                'group-hover:scale-110'
                            )}
                            onError={handleImageError}
                            onLoad={handleImageLoad}
                            loading="lazy"
                        />
                    </Link>
                    
                    {/* Modern Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    
                    {/* Wishlist Button */}
                    <div className="absolute top-4 right-4 z-20 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                        <WishlistButton 
                            product={product} 
                            className="w-10 h-10 bg-white/95 backdrop-blur-sm hover:bg-white shadow-lg hover:shadow-xl transition-all duration-200 border-0" 
                            iconSize="w-4 h-4"
                        />
                    </div>
                    
                    {/* Enhanced Badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                        {(!product?.isAvailable || (product?.quantity !== undefined && product?.quantity <= 0)) && (
                            <Badge variant="destructive" className="text-xs font-semibold px-3 py-1.5 shadow-lg">
                                Sold Out
                            </Badge>
                        )}
                        {discountPercentage > 0 && product?.isAvailable && (product?.quantity === undefined || product?.quantity > 0) && (
                            <Badge className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-xs font-semibold px-3 py-1.5 shadow-lg border-0">
                                -{discountPercentage}% OFF
                            </Badge>
                        )}
                        {variant === 'featured' && (
                            <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-black text-xs font-semibold px-3 py-1.5 shadow-lg border-0">
                                Featured
                            </Badge>
                        )}
                    </div>

                    {/* Modern Quick Action Buttons */}
                    {showQuickActions && product?.isAvailable && (product?.quantity === undefined || product?.quantity > 0) && (
                        <div className={cn(
                            "absolute bottom-4 left-4 right-4 flex gap-2 z-10",
                            "transform translate-y-full opacity-0",
                            "group-hover:translate-y-0 group-hover:opacity-100",
                            "transition-all duration-500 ease-out"
                        )}>
                            <Button 
                                size="sm" 
                                className="flex-1 h-10 text-sm font-medium bg-black/90 hover:bg-black text-white backdrop-blur-sm shadow-xl border-0 transition-all duration-200"
                            >
                                <TbShoppingBagPlus className="w-4 h-4 mr-2" />
                                Add to Cart
                            </Button>
                            <Button 
                                size="sm" 
                                variant="outline" 
                                className="h-10 px-3 bg-white/95 hover:bg-white backdrop-blur-sm shadow-xl border-0 transition-all duration-200"
                            >
                                <IoEyeOutline className="w-4 h-4" />
                            </Button>
                        </div>
                    )}
                </div>
                
                {/* Enhanced Content Section */}
                <div className={cn(
                    "space-y-3 bg-white transition-all duration-300",
                    variant === 'compact' ? 'p-3' : 'p-5'
                )}>
                    {/* Category Badge */}
                    {product?.category?.name && (
                        <div className="mb-2">
                            <Badge variant="outline" className="text-xs font-medium px-2 py-1 bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 transition-colors">
                                {product.category.name}
                            </Badge>
                        </div>
                    )}
                    
                    {/* Product Title */}
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                        <h4 className={cn(
                            'line-clamp-2 font-semibold text-gray-900 hover:text-primary transition-colors duration-300 leading-tight',
                            variant === 'compact' ? 'text-sm min-h-[2.25rem]' : 'text-base min-h-[2.5rem]'
                        )}>
                            {product?.name}
                        </h4>
                    </Link>
                    
                    {/* Enhanced Rating Section */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-0.5">
                                {renderRating()}
                            </div>
                            <span className="text-xs text-gray-500 font-medium">(4.5)</span>
                        </div>
                        
                        {/* Stock Status Indicator */}
                        {product?.isAvailable && (
                            <div className="flex items-center gap-1">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-xs text-green-600 font-medium">In Stock</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Enhanced Price Section */}
                    <div className='space-y-2'>
                        <div className='flex items-center gap-3'>
                            <span className={cn(
                                'font-bold text-gray-900',
                                variant === 'compact' ? 'text-lg' : 'text-xl'
                            )}>
                                {product?.sellingPrice?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                            </span>
                            {product?.mrp > product?.sellingPrice && (
                                <span className='line-through text-gray-400 text-sm font-medium'>
                                    {product?.mrp?.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </span>
                            )}
                        </div>
                        
                        {/* Additional Product Benefits */}
                        {product?.isAvailable && (
                            <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-1 text-green-600">
                                    <TbTruck className="w-3.5 h-3.5" />
                                    <span className="font-medium">Free delivery</span>
                                </div>
                                <span className="text-gray-500 font-medium">
                                    Save ₹{(product?.mrp - product?.sellingPrice)?.toLocaleString('en-IN')}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Mobile Quick Actions */}
                    {showQuickActions && product?.isAvailable && (
                        <div className="md:hidden pt-2 border-t border-gray-100">
                            <div className="flex gap-2">
                                <Button 
                                    size="sm" 
                                    className="flex-1 h-8 text-xs bg-black hover:bg-gray-800 text-white"
                                >
                                    <TbShoppingBagPlus className="w-3 h-3 mr-1" />
                                    Add to Cart
                                </Button>
                                <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-8 px-3 text-xs"
                                >
                                    <IoEyeOutline className="w-3 h-3" />
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

export default ProductCard