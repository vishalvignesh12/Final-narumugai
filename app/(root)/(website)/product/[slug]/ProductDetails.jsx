'use client'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import Loading from '@/components/Application/Loading'
import { Button } from '@/components/ui/button'
import { WEBSITE_CHECKOUT, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import { addProduct } from '@/store/reducer/cartReducer'
import axios from 'axios'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { showToast } from '@/lib/showToast'
import ProductReveiw from '@/components/Application/Website/ProductReveiw'
import ReviewList from '@/components/Application/Website/ReviewList'
import WishlistButton from '@/components/Application/Website/WishlistButton'

// --- HELPER FUNCTION to find a variant ---
const findVariant = (variants, color, size) => {
    if (!color || !size || !variants) return null;
    return variants.find(v => v.color === color && v.size === size);
};

const ProductDetails = ({ slug }) => {
    const router = useRouter()
    const dispatch = useDispatch()
    const auth = useSelector(store => store.authStore.auth)
    const cart = useSelector(store => store.cartStore)
    const [loading, setLoading] = useState(true)
    const [product, setProduct] = useState(null)
    const [variants, setVariants] = useState([])

    // --- STATES FOR SELECTION ---
    const [isVariantProduct, setIsVariantProduct] = useState(false);
    const [selectedColor, setSelectedColor] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [availableSizes, setAvailableSizes] = useState([]);
    
    // --- STATES FOR DISPLAY ---
    const [displayPrice, setDisplayPrice] = useState({ mrp: 0, sellingPrice: 0 });
    const [displayMedia, setDisplayMedia] = useState([]);
    const [displayStock, setDisplayStock] = useState(0);

    // Fetch product details
    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true)
            try {
                const { data } = await axios.get(`/api/product/details/${slug}`)
                
                if (!data.success || !data.product) {
                    throw new Error("Product not found");
                }
                
                const fetchedProduct = data.product;
                const fetchedVariants = data.variants || [];

                setProduct(fetchedProduct);
                setVariants(fetchedVariants);

                // --- Price fallbacks ---
                const baseMrp = fetchedProduct.mrp || 0;
                const baseSellingPrice = fetchedProduct.sellingPrice || 0;

                if (fetchedVariants.length === 1) {
                    const singleVariant = fetchedVariants[0];
                    setSelectedColor(singleVariant.color);
                    setSelectedSize(singleVariant.size);
                    setSelectedVariant(singleVariant);
                    
                    setDisplayPrice({ 
                        mrp: singleVariant.mrp || baseMrp, 
                        sellingPrice: singleVariant.sellingPrice || baseSellingPrice 
                    });
                    setDisplayMedia(singleVariant.media.length > 0 ? singleVariant.media : (fetchedProduct.media || []));
                    setDisplayStock(singleVariant.quantity || 0);
                    setIsVariantProduct(true);

                } else if (fetchedVariants.length > 1) {
                    const defaultColor = fetchedVariants[0].color;
                    setSelectedColor(defaultColor);
                    setIsVariantProduct(true);
                    
                    setDisplayPrice({ mrp: baseMrp, sellingPrice: baseSellingPrice });
                    setDisplayMedia(fetchedProduct.media || []);
                    setDisplayStock(0);

                } else {
                    setDisplayPrice({ mrp: baseMrp, sellingPrice: baseSellingPrice });
                    setDisplayMedia(fetchedProduct.media || []);
                    setDisplayStock(fetchedProduct.quantity || 0);
                    setIsVariantProduct(false);
                }

            } catch (error) {
                setProduct(null)
                showToast('error', error.message || 'Failed to fetch product details')
            } finally {
                setLoading(false)
            }
        }
        if (slug) {
            fetchProduct()
        }
    }, [slug])

    // --- UNIQUE COLORS (Memoized) ---
    const uniqueColors = useMemo(() => {
        if (!variants) return [];
        return [...new Set(variants.map(v => v.color))];
    }, [variants]);

    // --- UPDATE AVAILABLE SIZES when color changes ---
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
        }
    }, [selectedColor, variants, product]);

    // --- UPDATE SELECTED VARIANT when color or size changes ---
    useEffect(() => {
        if (!product) return;

        if (variants.length > 1) {
            const variant = findVariant(variants, selectedColor, selectedSize);
            setSelectedVariant(variant);

            if (variant) {
                setDisplayPrice({ 
                    mrp: variant.mrp || product.mrp || 0, 
                    sellingPrice: variant.sellingPrice || product.sellingPrice || 0
                });
                setDisplayMedia(variant.media.length > 0 ? variant.media : product.media);
                setDisplayStock(variant.quantity || 0);
            }
        }
    }, [selectedColor, selectedSize, variants, product]);


    // --- Add to Cart Handler ---
    const handleAddToCart = () => {
        if (!auth) {
            router.push(WEBSITE_LOGIN)
            return
        }

        if (!selectedVariant || !selectedVariant._id) {
            showToast('error', 'Please select from the available options');
            return;
        }

        if (displayStock <= 0) {
            showToast('error', 'This item is currently out of stock');
            return;
        }

        const itemToAdd = {
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
        
        dispatch(addProduct(itemToAdd));
        showToast('success', 'Product added to cart!');
    };

    // Check if item is already in cart
    const isItemInCart = useMemo(() => {
        if (!selectedVariant) return false;
        return cart.products.some(p => p.variantId === selectedVariant._id);
    }, [cart.products, selectedVariant]);


    // --- RENDER LOGIC ---

    if (loading) {
        return <Loading />
    }

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

    // --- *** CRASH FIX: Define category parts safely *** ---
    // This explicitly checks if product.category exists BEFORE trying to access its properties.
    const categoryName = (product.category && product.category.name) ? product.category.name : 'Uncategorized';
    const categorySlug = (product.category && product.category.slug) ? product.category.slug : 'uncategorized';
    // --- *** END OF FIX *** ---

    const breadCrumb = {
        title: product.name || "Product",
        links: [
            { label: "Shop", href: "/shop" },
            { label: categoryName, href: `/categories/${categorySlug}` },
            { label: product.name || "Product" },
        ],
    };

    return (
        <div>
            <WebsiteBreadcrumb props={breadCrumb} />
            <div className="flex lg:flex-nowrap flex-wrap gap-10 my-20 lg:px-32 px-4">
                {/* Image Gallery */}
                <div className="lg:w-1/2 w-full">
                    <div className="grid grid-cols-2 gap-4">
                        {displayMedia && displayMedia.length > 0 ? (
                            displayMedia.map((imgUrl, index) => (
                                <div key={index} className="w-full h-auto bg-gray-100 rounded-lg overflow-hidden">
                                    <Image
                                        src={imgUrl}
                                        width={400}
                                        height={500}
                                        alt={`${product.name} ${index + 1}`}
                                        className="w-full h-full object-cover aspect-[4/5]"
                                        unoptimized
                                    />
                                </div>
                            ))
                        ) : (
                            <div className="w-full h-auto bg-gray-100 rounded-lg overflow-hidden col-span-2">
                                <Image
                                    src="/assets/images/img-placeholder.webp"
                                    width={800}
                                    height={1000}
                                    alt="Placeholder"
                                    className="w-full h-full object-cover aspect-[4/5]"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Details */}
                <div className="lg:w-1/2 w-full sticky top-24 h-fit">
                    <h2 className="text-3xl font-bold mb-3">{product.name || 'No Name'}</h2>
                    
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
                    
                    <p className="text-gray-600 mb-6">{product.shortDescription || ''}</p>

                    {variants && variants.length > 1 && (
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

                    {/* Stock Status */}
                    <div className="mb-6">
                        {(selectedVariant) && (
                            <p className={`font-semibold ${displayStock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {displayStock > 0 ? `In Stock (${displayStock} available)` : 'Out of Stock'}
                            </p>
                        )}
                        {isVariantProduct && !selectedVariant && variants && variants.length > 1 && (
                             <p className='font-semibold text-red-500'>
                                Please select options to view stock
                             </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mb-6">
                        {isItemInCart ? (
                            <Button 
                                className="flex-1 text-lg" 
                                size="lg" 
                                asChild
                            >
                                <Link href={WEBSITE_CHECKOUT}>Go to Cart</Link>
                            </Button>
                        ) : (
                            <Button 
                                className="flex-1 text-lg" 
                                size="lg"
                                onClick={handleAddToCart}
                                disabled={!selectedVariant || displayStock <= 0}
                            >
                                {displayStock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </Button>
                        )}
                        <WishlistButton 
                            productId={product._id} 
                            variantId={selectedVariant ? selectedVariant._id : null}
                        />
                    </div>
                    
                    <div className='text-sm text-gray-500'>
                        <p><span className='font-semibold text-gray-700'>SKU:</span> {selectedVariant ? selectedVariant.sku : (product.sku || 'N/A')}</p>
                        <p><span className='font-semibold text-gray-700'>Category:</span> {categoryName}</p>
                    </div>

                </div>
            </div>

            {/* Description & Reviews */}
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