'use client'
import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useSelector } from 'react-redux'
import { WEBSITE_WISHLIST } from '@/routes/WebsiteRoute'

const WishlistIcon = () => {
    const wishlistCount = useSelector(store => store.wishlistStore.count)

    return (
        <Link href={WEBSITE_WISHLIST} className='relative p-1 hover:bg-gray-100 rounded transition-colors'>
            <Heart 
                className='text-gray-500 hover:text-primary cursor-pointer'
                size={24}
            />
            {wishlistCount > 0 && (
                <span className='absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center'>
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
            )}
        </Link>
    )
}

export default WishlistIcon