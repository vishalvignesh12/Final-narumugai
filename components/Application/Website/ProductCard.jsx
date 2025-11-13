'use client'
import React, { useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import WishlistButton from './WishlistButton'

const ProductCard = ({ product }) => {
    if (!product) return null;

    // Determine the primary media image
    const primaryMedia = product.media && product.media.length > 0 
        ? product.media[0] 
        : '/assets/images/img-placeholder.webp';

    // Calculate display price
    const mrp = product.mrp || 0;
    const sellingPrice = product.sellingPrice || 0;
    const hasDiscount = mrp > sellingPrice;
    const discountPercentage = hasDiscount ? Math.round(((mrp - sellingPrice) / mrp) * 100) : 0;

    return (
        <div className="relative group border border-transparent hover:border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="absolute top-3 right-3 z-10">
                {/* NOTE: We pass product._id here. The WishlistButton logic
                    should handle adding the *base product* if no variant is available.
                    If your wishlist requires a variantId, this needs to be adapted.
                    For now, it's safer to wishlist the main product.
                */}
                <WishlistButton productId={product._id} variantId={null} />
            </div>

            {hasDiscount && (
                <div className="absolute top-3 left-3 z-10 bg-primary text-white text-xs font-semibold px-2 py-1 rounded">
                    -{discountPercentage}%
                </div>
            )}

            <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <Image
                        src={primaryMedia}
                        alt={product.name}
                        width={400}
                        height={500}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        unoptimized
                    />
                </div>
            </Link>

            <div className="p-4 bg-white">
                <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                    <h3 className="text-sm font-semibold text-gray-800 truncate mb-1" title={product.name}>
                        {product.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 mb-2">
                    <p className="text-lg font-bold text-primary">
                        {sellingPrice.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </p>
                    {hasDiscount && (
                        <p className="text-sm text-gray-400 line-through">
                            {mrp.toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                        </p>
                    )}
                </div>

                {/* REMOVED "Add to Cart" button from the card.
                    This forces the user to go to the product details page
                    to make a valid variant selection (color/size).
                    This is the safest way to prevent invalid items
                    from being added to the cart.
                */}
                <Button
                    asChild
                    className="w-full mt-2 bg-gray-100 text-gray-800 hover:bg-primary hover:text-white"
                >
                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                        {product.hasVariants ? 'Select Options' : 'View Details'}
                    </Link>
                </Button>
            </div>
        </div>
    )
}

export default ProductCard