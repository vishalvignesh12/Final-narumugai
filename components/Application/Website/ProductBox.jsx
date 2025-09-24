import React, { useState } from 'react'
import imgPlaceholder from '@/public/assets/images/img-placeholder.webp'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { Badge } from '@/components/ui/badge'
import WishlistButton from './WishlistButton'

const ProductBox = ({ product }) => {
    const [imageError, setImageError] = useState(false)
    
    const handleImageError = () => {
        setImageError(true)
    }

    return (
        <div className={`rounded-lg hover:shadow-lg border overflow-hidden transition-shadow duration-300 bg-white ${!product?.isAvailable ? 'opacity-75' : ''}`}>
            <div className='relative overflow-hidden'>
                <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                    <img
                        src={imageError ? imgPlaceholder.src : (product?.media[0]?.secure_url || imgPlaceholder.src)}
                        width={400}
                        height={400}
                        alt={product?.media[0]?.alt || product?.name}
                        title={product?.media[0]?.title || product?.name}
                        className='w-full xl:h-[300px] lg:h-[280px] md:h-[250px] sm:h-[200px] h-[150px] object-cover object-top transition-transform duration-300 hover:scale-105'
                        onError={handleImageError}
                        loading="lazy"
                    />
                </Link>
                
                {/* Wishlist Button */}
                <div className="absolute top-2 right-2">
                    <WishlistButton 
                        product={product} 
                        className="w-8 h-8" 
                        iconSize="w-4 h-4"
                    />
                </div>
                
                {/* Availability Badge */}
                {!product?.isAvailable && (
                    <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="text-xs">
                            Sold Out
                        </Badge>
                    </div>
                )}
            </div>
            <div className="p-3 border-t">
                <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                    <h4 className='line-clamp-2 lg:text-base md:text-sm text-sm font-medium mb-2 min-h-[2.5rem] lg:min-h-[3rem] hover:text-pink-600 transition-colors'>
                        {product?.name}
                    </h4>
                </Link>
                <div className='flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm'>
                    <span className='line-through text-gray-400 text-xs'>{product?.mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                    <span className='font-semibold text-primary lg:text-base text-sm'>{product?.sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}</span>
                </div>
            </div>
        </div>
    )
}

export default ProductBox