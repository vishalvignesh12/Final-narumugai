import React from 'react'
import ProductDetails from './ProductDetails'
import { Metadata } from 'next'
import { getBaseURL } from '@/lib/config'

// Database imports for direct database access in Vercel
import { connectDB } from '@/lib/databaseConnection'
import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'
import ReviewModel from '@/models/Review.model'

// Revalidate data to ensure fresh product info
export const revalidate = 300 // Revalidate every 5 minutes

// Enable dynamic params for handling dynamic product routes
export const dynamicParams = true;

export async function generateMetadata({ params, searchParams }) {
    const { slug } = await params
    const { color, size } = await searchParams

    try {
        // Connect to DB and query directly instead of calling internal API
        await connectDB();

        const filter = {
            deletedAt: null,
            slug: slug
        };

        // Get product 
        const getProduct = await ProductModel.findOne(filter).populate('media', 'secure_url').lean();

        if (!getProduct) {
            console.error(`Product not found for slug: ${slug}`);
            return {
                title: 'Product Details | Narumugai',
                description: 'Premium saree collection at Narumugai'
            };
        }

        // Get product variant 
        const variantFilter = {
            product: getProduct._id
        };

        if (size) {
            variantFilter.size = size;
        }
        if (color) {
            variantFilter.color = color;
        }

        let variant = await ProductVariantModel.findOne(variantFilter).populate('media', 'secure_url').lean();

        // If no specific variant found, try to get the first available variant
        if (!variant) {
            variant = await ProductVariantModel.findOne({ product: getProduct._id }).populate('media', 'secure_url').lean();
        }

        // If still no variant found, create a fallback variant from product data
        if (!variant) {
            variant = {
                _id: null,
                product: getProduct._id,
                color: 'Default',
                size: 'Default',
                mrp: getProduct.mrp,
                sellingPrice: getProduct.sellingPrice,
                discountPercentage: getProduct.discountPercentage,
                quantity: getProduct.quantity || 0,
                media: getProduct.media || []
            };
        }

        // Return metadata based on direct DB query
        return {
            title: `${getProduct.name} | Premium Saree Online | Narumugai`,
            description: `Buy ${getProduct.name} online at best price. Premium quality saree with ${variant?.color} color and ${variant?.size} size. Free shipping and easy returns.`,
            keywords: `${getProduct.name}, saree online, ${variant?.color} saree, ${variant?.size} saree, buy saree online, premium sarees`,
            openGraph: {
                title: `${getProduct.name} | Premium Saree Online | Narumugai`,
                description: `Buy ${getProduct.name} online at best price. Premium quality saree with free shipping.`,
                type: 'website',
                url: `${getBaseURL()}/product/${slug}`,
                siteName: 'Narumugai',
                locale: 'en_IN',
                images: [
                    {
                        url: variant?.media?.[0]?.secure_url || getProduct?.media?.[0]?.secure_url || '/assets/images/img-placeholder.webp',
                        width: 1200,
                        height: 630,
                        alt: `${getProduct.name} - ${variant?.color || ''} ${variant?.size || ''} | Narumugai Sarees`.trim(),
                        type: 'image/jpeg'
                    },
                    // Additional product images for better social media sharing
                    ...(variant?.media?.slice(1, 4) || getProduct?.media?.slice(1, 4) || []).map(img => ({
                        url: img.secure_url,
                        width: 1200,
                        height: 630,
                        alt: `${getProduct.name} - Additional view | Narumugai Sarees`,
                        type: 'image/jpeg'
                    }))
                ]
            },
            twitter: {
                card: 'summary_large_image',
                site: '@narumugai',
                creator: '@narumugai',
                title: `${getProduct.name} | Premium Saree Online | Narumugai`,
                description: `Buy ${getProduct.name} online at best price. Premium quality saree with free shipping.`,
                images: [variant?.media?.[0]?.secure_url || getProduct?.media?.[0]?.secure_url || '/assets/images/img-placeholder.webp'],
                app: {
                    name: {
                        iphone: 'Narumugai',
                        ipad: 'Narumugai',
                        googleplay: 'Narumugai'
                    },
                    id: {
                        iphone: 'narumugai-app',
                        ipad: 'narumugai-app',
                        googleplay: 'com.narumugai.app'
                    }
                }
            },
            alternates: {
                canonical: `${getBaseURL()}/product/${slug}`
            },
            // Additional metadata for better SEO and social sharing
            other: {
                'product:price:amount': variant.sellingPrice,
                'product:price:currency': 'INR',
                'product:availability': 'in stock',
                'product:condition': 'new',
                'product:brand': 'Narumugai',
                'product:retailer_item_id': variant._id || getProduct._id,
                'product:category': getProduct.category || 'Sarees',
                'product:color': variant?.color,
                'product:size': variant?.size,
                'business:contact_data:country_name': 'India',
                'business:contact_data:locality': 'Chennai',
                'business:contact_data:region': 'Tamil Nadu'
            }
        };
    } catch (error) {
        console.error('Error generating metadata:', error)
    }

    return {
        title: 'Product Details | Narumugai',
        description: 'Premium saree collection at Narumugai'
    }
}

const ProductPage = async ({ params, searchParams }) => {
    const { slug } = await params
    const { color, size } = await searchParams

    let url = `/api/product/details/${slug}`

    if (color && size) {
        url += `?color=${color}&size=${size}`
    }

    try {
        // Using fetch for internal API calls in Next.js App Router
        // In Vercel, relative URLs should work fine for internal API routes
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store', // Don't cache for now to ensure fresh data
            next: { revalidate: 300 } // Revalidate every 5 minutes
        });

        // If response is not ok, try to get the error message
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error fetching product:', errorText, 'URL:', url);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        const getProduct = await response.json();

        if (!getProduct.success) {
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Product not found.</h1>
                </div>
            )
        } else {
            const { product, variant } = getProduct.data
            
            return (
                <div>
                    {/* Product Structured Data */}
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: JSON.stringify({
                                "@context": "https://schema.org",
                                "@type": "Product",
                                "name": product.name,
                                "description": product.description?.replace(/<[^>]*>/g, '').substring(0, 200),
                                "sku": variant._id || product._id,
                                "brand": {
                                    "@type": "Brand",
                                    "name": "Narumugai"
                                },
                                "category": "Clothing > Women's Clothing > Sarees",
                                "image": variant?.media?.map(img => img.secure_url) || product?.media?.map(img => img.secure_url) || [],
                                "offers": {
                                    "@type": "Offer",
                                    "price": variant.sellingPrice,
                                    "priceCurrency": "INR",
                                    "availability": "https://schema.org/InStock",
                                    "seller": {
                                        "@type": "Organization",
                                        "name": "Narumugai"
                                    },
                                    "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                                },
                                "aggregateRating": {
                                    "@type": "AggregateRating",
                                    "ratingValue": "4.5",
                                    "reviewCount": getProduct.data.reviewCount || 0
                                },
                                "additionalProperty": [
                                    {
                                        "@type": "PropertyValue",
                                        "name": "Color",
                                        "value": variant.color
                                    },
                                    {
                                        "@type": "PropertyValue",
                                        "name": "Size",
                                        "value": variant.size
                                    },
                                    {
                                        "@type": "PropertyValue",
                                        "name": "Material",
                                        "value": "Premium Fabric"
                                    }
                                ],
                                "breadcrumb": {
                                    "@type": "BreadcrumbList",
                                    "itemListElement": [
                                        {
                                            "@type": "ListItem",
                                            "position": 1,
                                            "name": "Home",
                                            "item": "https://narumugai.com"
                                        },
                                        {
                                            "@type": "ListItem",
                                            "position": 2,
                                            "name": "Shop Sarees",
                                            "item": "https://narumugai.com/shop"
                                        },
                                        {
                                            "@type": "ListItem",
                                            "position": 3,
                                            "name": product.name,
                                            "item": `https://narumugai.com/product/${slug}`
                                        }
                                    ]
                                }
                            })
                        }}
                    />
                    
                    <ProductDetails
                        product={getProduct?.data?.product}
                        variant={getProduct?.data?.variant}
                        colors={getProduct?.data?.colors}
                        sizes={getProduct?.data?.sizes}
                        reviewCount={getProduct?.data?.reviewCount}
                    />
                </div>
            )
        }
    } catch (error) {
        console.error('Error fetching product data:', error)
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold'>Product not found.</h1>
            </div>
        )
    }

}

export default ProductPage