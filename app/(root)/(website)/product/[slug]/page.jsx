import React from 'react'
import ProductDetails from './ProductDetails'
import { Metadata } from 'next'
import { getBaseURL } from '@/lib/config'

// Revalidate data to ensure fresh product info
export const revalidate = 300 // Revalidate every 5 minutes

// Enable dynamic params for handling dynamic product routes
export const dynamicParams = true;

// Helper function to get the full base URL
function getFullBaseURL() {
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL;
    }
    return 'http://localhost:3000';
}

export async function generateMetadata({ params, searchParams }) {
    const { slug } = params
    const { color, size } = searchParams || {}

    let apiPath = `/api/product/details/${slug}`

    if (color && size) {
        apiPath += `?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`
    }

    try {
        const baseUrl = getFullBaseURL();
        const fullUrl = `${baseUrl}${apiPath}`;
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            next: { revalidate: 300 }
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error fetching metadata:', errorText, 'URL:', fullUrl);
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }
        
        const getProduct = await response.json();
        
        if (getProduct.success) {
            const { product, variant } = getProduct.data
            
            return {
                title: `${product.name} | Premium Saree Online | Narumugai`,
                description: `Buy ${product.name} online at best price. Premium quality saree with ${variant?.color} color and ${variant?.size} size. Free shipping and easy returns.`,
                keywords: `${product.name}, saree online, ${variant?.color} saree, ${variant?.size} saree, buy saree online, premium sarees`,
                openGraph: {
                    title: `${product.name} | Premium Saree Online | Narumugai`,
                    description: `Buy ${product.name} online at best price. Premium quality saree with free shipping.`,
                    type: 'website',
                    url: `${getBaseURL()}/product/${slug}`,
                    siteName: 'Narumugai',
                    locale: 'en_IN',
                    images: [
                        {
                            url: variant?.media?.[0]?.secure_url || product?.media?.[0]?.secure_url || '/assets/images/img-placeholder.webp',
                            width: 1200,
                            height: 630,
                            alt: `${product.name} - ${variant?.color || ''} ${variant?.size || ''} | Narumugai Sarees`.trim(),
                            type: 'image/jpeg'
                        },
                        ...(variant?.media?.slice(1, 4) || product?.media?.slice(1, 4) || []).map(img => ({
                            url: img.secure_url,
                            width: 1200,
                            height: 630,
                            alt: `${product.name} - Additional view | Narumugai Sarees`,
                            type: 'image/jpeg'
                        }))
                    ]
                },
                twitter: {
                    card: 'summary_large_image',
                    site: '@narumugai',
                    creator: '@narumugai',
                    title: `${product.name} | Premium Saree Online | Narumugai`,
                    description: `Buy ${product.name} online at best price. Premium quality saree with free shipping.`,
                    images: [variant?.media?.[0]?.secure_url || product?.media?.[0]?.secure_url || '/assets/images/img-placeholder.webp'],
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
                other: {
                    'product:price:amount': variant.sellingPrice,
                    'product:price:currency': 'INR',
                    'product:availability': 'in stock',
                    'product:condition': 'new',
                    'product:brand': 'Narumugai',
                    'product:retailer_item_id': variant._id || product._id,
                    'product:category': product.category || 'Sarees',
                    'product:color': variant?.color,
                    'product:size': variant?.size,
                    'business:contact_data:country_name': 'India',
                    'business:contact_data:locality': 'Chennai',
                    'business:contact_data:region': 'Tamil Nadu'
                }
            }
        }
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

    let apiPath = `/api/product/details/${slug}`

    if (color && size) {
        apiPath += `?color=${encodeURIComponent(color)}&size=${encodeURIComponent(size)}`
    }

    try {
        // Use full base URL for server-side fetch
        const baseUrl = getFullBaseURL();
        const fullUrl = `${baseUrl}${apiPath}`;
        
        const response = await fetch(fullUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            cache: 'no-store',
            next: { revalidate: 300 }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText, 'Full URL:', fullUrl);
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