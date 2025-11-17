'use client'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { Button } from '@/components/ui/button'
import { WEBSITE_CHECKOUT, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { addProduct } from '@/store/reducer/cartReducer'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showToast } from '@/lib/showToast'
import ProductReveiw from '@/components/Application/Website/ProductReveiw'
import ReviewList from '@/components/Application/Website/ReviewList'
import WishlistButton from '@/components/Application/Website/WishlistButton'

// --- HELPER FUNCTION (Unchanged) ---
const findVariant = (variants, color, size) => {
    if (!color || !size || !variants) return null;
    return variants.find(v => v.color === color && v.size === size);
};

const ProductDetails = ({ 
    product: initialProduct, 
    defaultVariant: initialVariant, 
    allVariants: initialVariants 
}) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const auth = useSelector(store => store.authStore.auth)
    const cart = useSelector(store => store.cartStore)
    
    // --- Initialize state from props ---
    const [product, setProduct] = useState(initialProduct)
    const [variants, setVariants] = useState(initialVariants || [])

    // --- STATES FOR SELECTION (Initialize from props) ---
    const [isVariantProduct, setIsVariantProduct] = useState(initialVariants && initialVariants.length > 0);
    const [selectedColor, setSelectedColor] = useState(initialVariant ? initialVariant.color : null);
    const [selectedSize, setSelectedSize] = useState(initialVariant ? initialVariant.size : null);
    const [selectedVariant, setSelectedVariant] = useState(initialVariant);
    
    const [availableSizes, setAvailableSizes] = useState([]);
    
    // --- STATES FOR DISPLAY (Initialize from props) ---
    const [displayPrice, setDisplayPrice] = useState({ 
        mrp: (initialVariant ? initialVariant.mrp : initialProduct?.mrp) || 0, 
        sellingPrice: (initialVariant ? initialVariant.sellingPrice : initialProduct?.sellingPrice) || 0
    });
    
    const [displayMedia, setDisplayMedia] = useState(
        (initialVariant && initialVariant.media.length > 0 
        ? initialVariant.media 
        : initialProduct?.media) || []
    );
    
    const [displayStock, setDisplayStock] = useState(
        (initialVariant ? initialVariant.quantity : initialProduct?.quantity) || 0
    );

    // --- NEW STATE for Amazon-style Image Gallery ---
    const [activeImage, setActiveImage] = useState(
        (initialVariant && initialVariant.media.length > 0 
        ? initialVariant.media[0]?.secure_url || initialVariant.media[0] 
        : initialProduct?.media[0]?.secure_url || initialProduct?.media[0]) || '/assets/images/img-placeholder.webp'
    );


    // --- UNIQUE COLORS (Memoized) (Unchanged) ---
    const uniqueColors = useMemo(() => {
        if (!variants) return [];
        return [...new Set(variants.map(v => v.color))];
    }, [variants]);

    // --- UPDATE AVAILABLE SIZES (Logic is unchanged) ---
    useEffect(() => {
        if (!product) return;

        const baseMrp = product.mrp || 0;
        const baseSellingPrice = product.sellingPrice || 0;

        if (selectedColor && variants.length > 1) {
            const sizesForColor = variants
                .filter(v => v.color === selectedColor)
                .map(v => v.size);
            setAvailableSizes(sizesForColor);
            
            setSelectedSize(null);
            setSelectedVariant(null);
            
            setDisplayPrice({ mrp: baseMrp, sellingPrice: baseSellingPrice });
            setDisplayStock(0);
        } else if (selectedColor && variants.length === 1) {
             setAvailableSizes(variants[0] ? [variants[0].size] : []);
        } else if (!selectedColor && variants.length > 0) {
            const allSizes = [...new Set(variants.map(v => v.size))];
            setAvailableSizes(allSizes);
        }
    }, [selectedColor, variants, product]);

    // --- UPDATE SELECTED VARIANT (Updated to change Active Image) ---
    useEffect(() => {
        if (!product) return;

        if (variants.length > 0) {
            const variant = findVariant(variants, selectedColor, selectedSize);
            setSelectedVariant(variant);

            if (variant) {
                setDisplayPrice({ 
                    mrp: variant.mrp || product.mrp || 0, 
                    sellingPrice: variant.sellingPrice || product.sellingPrice || 0
                });
                
                // Update media gallery based on variant
                const newMedia = variant.media.length > 0 ? variant.media : product.media;
                setDisplayMedia(newMedia);
                setActiveImage(newMedia[0]?.secure_url || newMedia[0] || '/assets/images/img-placeholder.webp');
                
                setDisplayStock(variant.quantity || 0);

            } else if (variants.length === 1 && !selectedColor && !selectedSize) {
                // Handle single variant products
                const singleVariant = variants[0];
                setSelectedColor(singleVariant.color);
                setSelectedSize(singleVariant.size);
                setSelectedVariant(singleVariant);
                 setDisplayPrice({ 
                    mrp: singleVariant.mrp || product.mrp || 0, 
                    sellingPrice: singleVariant.sellingPrice || product.sellingPrice || 0
                });

                const newMedia = singleVariant.media.length > 0 ? singleVariant.media : product.media;
                setDisplayMedia(newMedia);
                setActiveImage(newMedia[0]?.secure_url || newMedia[0] || '/assets/images/img-placeholder.webp');
                
                setDisplayStock(singleVariant.quantity || 0);
            }
        }
    }, [selectedColor, selectedSize, variants, product]);


    // --- Check if item is already in cart (Unchanged) ---
    const isItemInCart = useMemo(() => {
        if (!isVariantProduct) {
             return cart.products.some(p => p.productId === product._id && !p.variantId);
        }
        if (!selectedVariant) return false;
        return cart.products.some(p => p.variantId === selectedVariant._id);
    }, [cart.products, selectedVariant, isVariantProduct, product]);


    // --- Get Item to Add (Helper for Add to Cart and Buy Now) ---
    const getItemToAdd = () => {
        if (isVariantProduct) {
             if (!selectedVariant || !selectedVariant._id) {
                showToast('error', 'Please select from the available options');
                return null;
            }
            if (displayStock <= 0) {
                showToast('error', 'This item is currently out of stock');
                return null;
            }
            return {
                productId: product._id,
                variantId: selectedVariant._id,
                name: product.name || 'Product',
                url: product.slug,
                size: selectedVariant.size,
                color: selectedVariant.color,
                mrp: selectedVariant.mrp || 0,
                sellingPrice: selectedVariant.sellingPrice || 0,
                media: selectedVariant.media && selectedVariant.media.length > 0 ? selectedVariant.media[0] : (product.media && product.media.length > 0 ? product.media[0] : '/assets/images/img-placeholder.webp'),
                qty: 1
            };
        } else {
             if (displayStock <= 0) {
                showToast('error', 'This item is currently out of stock');
                return null;
            }
            return {
                productId: product._id,
                variantId: null, // No variant ID
                name: product.name || 'Product',
                url: product.slug,
                size: 'One Size',
                color: 'Default',
                mrp: product.mrp || 0,
                sellingPrice: product.sellingPrice || 0,
                media: product.media && product.media.length > 0 ? product.media[0] : '/assets/images/img-placeholder.webp',
                qty: 1
            };
        }
    }

    // --- Add to Cart Handler ---
    const handleAddToCart = () => {
        if (!auth) {
            router.push(WEBSITE_LOGIN)
            return
        }
        
        const itemToAdd = getItemToAdd();
        if (itemToAdd) {
            dispatch(addProduct(itemToAdd));
            showToast('success', 'Product added to cart!');
        }
    };

    // --- NEW "Buy Now" Handler ---
    const handleBuyNow = () => {
        if (!auth) {
            router.push(WEBSITE_LOGIN)
            return
        }

        const itemToAdd = getItemToAdd();
        if (itemToAdd) {
            // Add to cart only if it's not already there
            if (!isItemInCart) {
                dispatch(addProduct(itemToAdd));
            }
            // Immediately redirect to checkout
            router.push(WEBSITE_CHECKOUT);
        }
    }


    // --- RENDER LOGIC ---
    if (!product) {
        return (
            <div className='h-[60vh] flex flex-col justify-center items-center gap-4'>
                <h2 className='text-3xl font-semibold'>Product not found!</h2>
                <p className='text-gray-600'>The product you are looking for does not exist.</p>
                <Button asChild>
                    <Link href={WEBSITE_SHOP}>Continue Shopping</Link>
                </Button>
            </div>
        )
    }

    const categoryName = (product.category && product.category.name) ? product.category.name : 'Uncategorized';
    const categorySlug = (product.category && product.category.slug) ? product.category.slug : 'uncategorized';

    const breadCrumb = {
        title: product.name || "Product",
        links: [
            { label: "Shop", href: "/shop" },
            { label: categoryName, href: `/categories/${categorySlug}` },
            { label: product.name || "Product" },
        ],
    };

    const optionsRequired = isVariantProduct && variants.length > 1;
    const canAddToCart = !isVariantProduct || (selectedVariant && selectedVariant._id);

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumb} />
            
            {/* --- NEW AMAZON-STYLE LAYOUT --- */}
            <div className="flex lg:flex-nowrap flex-wrap gap-10 my-20 lg:px-32 px-4">
                
                {/* --- 1. IMAGE GALLERY (LEFT - 5/12) --- */}
                <div className="lg:w-5/12 w-full">
                    <div className="flex flex-col gap-4 sticky top-24">
                        {/* Main Image */}
                        <div className="w-full h-auto bg-gray-100 rounded-lg overflow-hidden">
                            <Image
                                src={activeImage}
                                width={800}
                                height={1000}
                                alt={`${product.name} main view`}
                                className="w-full h-full object-cover aspect-[4/5]"
                                unoptimized
                            />
                        </div>
                        {/* Thumbnails */}
                        <div className="flex flex-wrap gap-3">
                            {displayMedia && displayMedia.length > 1 && displayMedia.map((img, index) => {
                                const imgUrl = img.secure_url || img; // Handle both object and string
                                return (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImage(imgUrl)}
                                        className={`w-20 h-24 rounded-md overflow-hidden border-2 transition-all ${
                                            imgUrl === activeImage ? 'border-primary' : 'border-gray-200 hover:border-gray-400'
                                        }`}
                                    >
                                        <Image
                                            src={imgUrl}
                                            width={80}
                                            height={96}
                                            alt={`${product.name} thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                            unoptimized
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* --- 2. INFO & BUY BOX (RIGHT - 7/12) --- */}
                <div className="lg:w-7/12 w-full">
                    {/* Product Title */}
                    <h2 className="text-3xl font-bold mb-3">{product.name || 'No Name'}</h2>
                    
                    {/* TODO: Add Star Rating Component Here */}
                    {/* <StarRating rating={4.5} reviewCount={reviewCount} /> */}
                    
                    <div className="flex flex-wrap gap-6">
                        
                        {/* Left Info Column */}
                        <div className="flex-1 min-w-[280px]">
                            {/* Price */}
                            <div className="mb-4">
                                <span className="text-2xl font-bold text-primary">
                                    {(displayPrice.sellingPrice || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </span>
                                {(displayPrice.mrp || 0) > (displayPrice.sellingPrice || 0) && (
                                    <span className="text-lg text-gray-500 line-through ml-2">
                                        {(displayPrice.mrp || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                    </span>
                                )}
                            </div>

                            {/* Short Description */}
                            <p className="text-gray-600 mb-6">{product.shortDescription || ''}</p>

                            {/* Variations (Colors/Sizes) */}
                            {isVariantProduct && variants.length > 1 && (
                                <>
                                    {/* Colors */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-3">Color: <span className='font-normal'>{selectedColor || 'Select'}</span></h4>
                                        <div className="flex flex-wrap gap-3">
                                            {uniqueColors.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor === color ? 'border-primary scale-110' : 'border-gray-300'}`}
                                                    style={{ backgroundColor: color, opacity: 0.8 }}
                                                    title={color}
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sizes */}
                                    <div className="mb-6">
                                        <h4 className="font-semibold mb-3">Size: <span className='font-normal'>{selectedSize || 'Select'}</span></h4>
                                        <div className="flex flex-wrap gap-3">
                                            {availableSizes.length > 0 ? availableSizes.map((size) => {
                                                const variant = findVariant(variants, selectedColor, size);
                                                const isStockAvailable = variant && variant.quantity > 0;
                                                
                                                return (
                                                    <button
                                                        key={size}
                                                        onClick={() => setSelectedSize(size)}
                                                        disabled={!isStockAvailable}
                                                        className={`px-4 py-2 rounded-lg border transition-all ${selectedSize === size ? 'bg-primary text-white border-primary' : 'bg-white text-gray-800 border-gray-300'} ${!isStockAvailable ? 'opacity-50 cursor-not-allowed line-through' : 'hover:border-gray-800'}`}
                                                    >
                                                        {size}
                                                    </button>
                                                );
                                            }) : (
                                                <p className='text-sm text-gray-500'>
                                                    {selectedColor ? 'No sizes available for this color' : 'Please select a color first'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Right "Buy Box" Column */}
                        <div className="w-full lg:w-[250px]">
                            <div className="border rounded-lg p-4">
                                {/* Price (repeated) */}
                                <span className="text-2xl font-bold text-primary">
                                    {(displayPrice.sellingPrice || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                                </span>
                                
                                {/* Delivery Info (Dynamic date) */}
                                <p className="text-sm text-gray-600 mt-2">
                                    <span className="font-semibold text-green-700">FREE Delivery</span>
                                    {' '}by {new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}.
                                </p>

                                {/* Stock Status */}
                                <div className="my-4">
                                    {(optionsRequired && !selectedVariant) ? (
                                        <p className='font-semibold text-red-500'>Select options</p>
                                    ) : (
                                        <p className={`font-semibold text-lg ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                            {displayStock > 0 ? 'In Stock' : 'Out of Stock'}
                                        </p>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col gap-3 mt-4">
                                    {isItemInCart ? (
                                        <Button className="w-full text-lg" size="lg" asChild>
                                            <Link href={WEBSITE_CHECKOUT}>Go to Cart</Link>
                                        </Button>
                                    ) : (
                                        <Button 
                                            className="w-full text-lg" 
                                            size="lg"
                                            onClick={handleAddToCart}
                                            disabled={!canAddToCart || displayStock <= 0}
                                        >
                                            {displayStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </Button>
                                    )}
                                    
                                    {/* Buy Now Button (New) */}
                                    <Button 
                                        className="w-full text-lg" 
                                        size="lg"
                                        variant="secondary" // You can style this differently
                                        onClick={handleBuyNow} 
                                        disabled={!canAddToCart || displayStock <= 0}
                                    >
                                        Buy Now
                                    </Button>
                                </div>

                                <div className="mt-4">
                                    <WishlistButton 
                                        productId={product._id} 
                                        variantId={selectedVariant ? selectedVariant._id : null}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* SKU/Category (at the bottom) */}
                    <div className='text-sm text-gray-500 mt-6'>
                        <p><span className='font-semibold text-gray-700'>SKU:</span> {selectedVariant ? selectedVariant.sku : (product.sku || 'N/A')}</p>
                        <p><span className='font-semibold text-gray-700'>Category:</span> {categoryName}</p>
                    </div>
                </div>

            </div>

            {/* --- 3. DESCRIPTION & REVIEWS (Bottom Section) --- */}
            <div className='lg:px-32 px-4 my-20'>
                <h3 className='text-2xl font-semibold mb-4'>Description</h3>
                <div 
                    className='prose prose-lg max-w-none' 
                    dangerouslySetInnerHTML={{ __html: product.description || '' }} 
                />

                <div className="mt-20">
                    <h3 className='text-2xl font-semibold mb-4'>Reviews</h3>
                    {auth ? (
                        <ProductReveiw productId={product._id} />
                    ) : (
                        <p>Please <Link href={WEBSITE_LOGIN} className="text-primary underline">login</Link> to write a review.</p>
                    )}
                    <ReviewList productId={product._id} />
                </div>
            </div>
        </div>
    )
}

export default ProductDetails