'use client'
import React from 'react'
import { Heart } from 'lucide-react'
import { useSelector, useDispatch } from 'react-redux'
import { addToWishlist, removeFromWishlist } from '@/store/reducer/wishlistReducer'
import { showToast } from '@/lib/showToast'

const WishlistButton = ({ product, className = "w-10 h-10", iconSize = "w-5 h-5" }) => {
    const dispatch = useDispatch()
    const wishlistProducts = useSelector(store => store.wishlistStore.products)
    
    const isInWishlist = wishlistProducts.some(item => item._id === product._id)
    
    const handleWishlistToggle = (e) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (isInWishlist) {
            dispatch(removeFromWishlist(product._id))
            showToast('Removed from wishlist', 'success')
        } else {
            dispatch(addToWishlist(product))
            showToast('Added to wishlist', 'success')
        }
    }
    
    return (
        <button 
            onClick={handleWishlistToggle}
            className={`${className} bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all duration-300 ${isInWishlist ? 'text-red-500' : 'text-gray-600'} hover:scale-110`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart className={`${iconSize} ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
    )
}

export default WishlistButton