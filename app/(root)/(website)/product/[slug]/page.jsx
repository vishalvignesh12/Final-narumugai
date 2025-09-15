import axios from 'axios'
import React from 'react'
import ProductDetails from './ProductDetails'
import { Metadata } from 'next'

export async function generateMetadata({ params, searchParams }) {
    const { slug } = await params
    const { color, size } = await searchParams

    let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/details/${slug}`
    if (color && size) {
        url += `?color=${color}&size=${size}`
    }

    try {
        const { data: getProduct } = await axios.get(url)
        
        if (getProduct.success) {
            const { product, variant } = getProduct.data
            
            return {
                title: `${product.name} | Premium Saree Online | Narumugai`,
                description: `Buy ${product.name} online at best price. Premium quality saree with ${variant?.color} color and ${variant?.size} size. Free shipping and easy returns.`,
                keywords: `${product.name}, saree online, ${variant?.color} saree, ${variant?.size} saree, buy saree online, premium sarees`,
                openGraph: {
                    title: `${product.name} | Premium Saree Online | Narumugai`,
                    description: `Buy ${product.name} online at best price. Premium quality saree with free shipping.`,
                    type: 'product',
                    url: `https://narumugai.com/product/${slug}`,
                    images: [
                        {
                            url: variant?.media?.[0]?.secure_url || product?.media?.[0]?.secure_url || '',
                            width: 800,
                            height: 800,
                            alt: product.name
                        }
                    ]
                },
                twitter: {
                    card: 'summary_large_image',
                    title: `${product.name} | Premium Saree Online | Narumugai`,
                    description: `Buy ${product.name} online at best price. Premium quality saree with free shipping.`
                },
                alternates: {
                    canonical: `https://narumugai.com/product/${slug}`
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

    let url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/product/details/${slug}`

    if (color && size) {
        url += `?color=${color}&size=${size}`
    }

    const { data: getProduct } = await axios.get(url)

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

}

export default ProductPage