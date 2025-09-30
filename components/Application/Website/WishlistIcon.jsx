'use client'
import React from 'react'
import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useSelector } from 'react-redux'
import { WEBSITE_WISHLIST } from '@/routes/WebsiteRoute'

const WishlistIcon = () => {
    const wishlistCount = useSelector(store => store.wishlistStore.count)

    return (
        <Link href={WEBSITE_WISHLIST} className='p-1 hover:bg-gray-100 rounded-full transition-colors'>
            <Heart 
                className={`${wishlistCount > 0 ? 'text-red-500 fill-current' : 'text-gray-500 hover:text-pink-600'} cursor-pointer`}
                size={24}
            />
        </Link>
    )
}

export default WishlistIcon