'use client'
import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { removeFromWishlist, clearWishlist } from '@/store/reducer/wishlistReducer'
import Link from 'next/link'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { WEBSITE_PRODUCT_DETAILS } from '@/routes/WebsiteRoute'
import { showToast } from '@/lib/showToast'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'

const breadcrumbData = {
    title: 'My Wishlist',
    links: [{ label: 'Wishlist' }]
}

const WishlistPage = () => {
    const dispatch = useDispatch()
    const wishlistProducts = useSelector(store => store.wishlistStore.products)
    const wishlistCount = useSelector(store => store.wishlistStore.count)

    const handleRemoveFromWishlist = (productId) => {
        dispatch(removeFromWishlist(productId))
        showToast('Removed from wishlist', 'success')
    }

    const handleClearWishlist = () => {
        if (window.confirm('Are you sure you want to clear your wishlist?')) {
            dispatch(clearWishlist())
            showToast('Wishlist cleared', 'success')
        }
    }

    return (
        <div>
            <WebsiteBreadcrumb props={breadcrumbData} />
            
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            My Wishlist
                        </h1>
                        <p className="text-gray-600">
                            {wishlistCount} {wishlistCount === 1 ? 'item' : 'items'} saved
                        </p>
                    </div>
                    
                    {wishlistProducts.length > 0 && (
                        <button
                            onClick={handleClearWishlist}
                            className="flex items-center px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                        </button>
                    )}
                </div>

                {wishlistProducts.length === 0 ? (
                    <div className="text-center py-16">
                        <Heart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
                        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                            Your wishlist is empty
                        </h2>
                        <p className="text-gray-600 mb-8">
                            Start adding your favorite sarees to keep track of them
                        </p>
                        <Link
                            href="/shop"
                            className="inline-flex items-center px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg hover:bg-pink-700 transition-colors"
                        >
                            <ShoppingBag className="w-5 h-5 mr-2" />
                            Continue Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {wishlistProducts.map((product) => (
                            <div key={product._id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                                <div className="relative overflow-hidden">
                                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                                        <img
                                            src={product.media?.[0]?.secure_url || product.featuredImage?.secure_url || '/api/placeholder/300/400'}
                                            alt={product.name || product.title}
                                            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                                            onError={(e) => {
                                                e.target.src = '/api/placeholder/300/400'
                                            }}
                                        />
                                    </Link>
                                    
                                    <button
                                        onClick={() => handleRemoveFromWishlist(product._id)}
                                        className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-red-500 hover:bg-white hover:scale-110 transition-all duration-300"
                                        title="Remove from wishlist"
                                    >
                                        <Heart className="w-5 h-5 fill-current" />
                                    </button>
                                    
                                    {!product?.isAvailable && (
                                        <div className="absolute top-4 left-4">
                                            <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                                                Sold Out
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-6">
                                    <Link href={WEBSITE_PRODUCT_DETAILS(product.slug)}>
                                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-pink-600 transition-colors">
                                            {product.name || product.title}
                                        </h3>
                                    </Link>
                                    
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex flex-col">
                                            {product.mrp && product.sellingPrice && product.mrp > product.sellingPrice && (
                                                <span className="text-sm text-gray-400 line-through">
                                                    ₹{product.mrp.toLocaleString('en-IN')}
                                                </span>
                                            )}
                                            <span className="text-xl font-bold text-pink-600">
                                                ₹{(product.sellingPrice || product.price || 0).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    <Link
                                        href={WEBSITE_PRODUCT_DETAILS(product.slug)}
                                        className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                                    >
                                        View Details
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default WishlistPage