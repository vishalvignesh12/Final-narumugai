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

export async function generateMetadata({ params }) {
    const { slug } = params;
    
    console.log('Metadata params slug:', slug); // Debug log for Vercel

    try {
        // Connect to DB and query directly instead of calling internal API
        await connectDB();

        const filter = {
            deletedAt: null,
            slug: slug
        };

        console.log('Metadata: Querying product with filter:', filter); // Debug log for Vercel

        // Get product 
        const getProduct = await ProductModel.findOne(filter).populate('media', 'secure_url').lean();

        console.log('Metadata: Product found:', !!getProduct); // Debug log for Vercel

        if (!getProduct) {
            console.error(`Product not found for slug: ${slug}`);
            return {
                title: 'Product Details | Narumugai',
                description: 'Premium saree collection at Narumugai'
            };
        }

        // Get the first available product variant 
        let variant = await ProductVariantModel.findOne({ product: getProduct._id }).populate('media', 'secure_url').lean();

        // If no variant found, create a fallback variant from product data
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

        // Get review count 
        const reviewCount = await ReviewModel.countDocuments({ product: getProduct._id });

        // Return metadata based on direct DB query
        return {
            title: `${getProduct.name} | Premium Saree Online | Narumugai`,
            description: `Buy ${getProduct.name} online at best price. Premium quality saree. Free shipping and easy returns.`,
            keywords: `${getProduct.name}, saree online, buy saree online, premium sarees`,
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
                        alt: `${getProduct.name} | Narumugai Sarees`,
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
        console.error('Error generating metadata:', error);
        return {
            title: 'Product Details | Narumugai',
            description: 'Premium saree collection at Narumugai'
        };
    }
}

const ProductPage = async ({ params }) => {
    const { slug } = params;
    
    console.log('Product page params slug:', slug); // Debug log for Vercel

    try {
        // Connect to DB and query directly instead of calling internal API
        await connectDB();

        const filter = {
            deletedAt: null,
            slug: slug
        };

        console.log('Querying product with filter:', filter); // Debug log for Vercel

        // Get product 
        const product = await ProductModel.findOne(filter).populate('media', 'secure_url').lean();

        console.log('Product found:', !!product); // Debug log for Vercel

        if (!product) {
            console.error(`Product not found for slug: ${slug} in main component`);
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Product not found.</h1>
                </div>
            );
        }

        // Get the first available product variant 
        let variant = await ProductVariantModel.findOne({ product: product._id }).populate('media', 'secure_url').lean();

        // If no variant found, create a fallback variant from product data
        if (!variant) {
            variant = {
                _id: null,
                product: product._id,
                color: 'Default',
                size: 'Default',
                mrp: product.mrp,
                sellingPrice: product.sellingPrice,
                discountPercentage: product.discountPercentage,
                quantity: product.quantity || 0,
                media: product.media || []
            };
        }

        // get color and size 
        const getColor = await ProductVariantModel.distinct('color', { product: product._id });

        const getSize = await ProductVariantModel.aggregate([
            { $match: { product: product._id } },
            { $sort: { _id: 1 } },
            {
                $group: {
                    _id: "$size",
                    first: { $first: "$_id" }
                }
            },
            { $sort: { first: 1 } },
            { $project: { _id: 0, size: "$_id" } }
        ]);

        // If no variants exist, provide default options
        const colors = getColor.length > 0 ? getColor : ['Default'];
        const sizes = getSize.length > 0 ? getSize.map(item => item.size) : ['Default'];

        // get review count 
        const reviewCount = await ReviewModel.countDocuments({ product: product._id });

        const productData = {
            product: product,
            variant: variant,
            colors: colors,
            sizes: sizes,
            reviewCount: reviewCount
        };
        
        // Destructure the data for use in the component
        const { product: prod, variant: varnt } = productData;
        
        return (
            <div>
                {/* Product Structured Data */}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Product",
                            "name": prod.name,
                            "description": prod.description?.replace(/<[^>]*>/g, '').substring(0, 200),
                            "sku": varnt._id || prod._id,
                            "brand": {
                                "@type": "Brand",
                                "name": "Narumugai"
                            },
                            "category": "Clothing > Women's Clothing > Sarees",
                            "image": varnt?.media?.map(img => img.secure_url) || prod?.media?.map(img => img.secure_url) || [],
                            "offers": {
                                "@type": "Offer",
                                "price": varnt.sellingPrice,
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
                                "reviewCount": productData.reviewCount || 0
                            },
                            "additionalProperty": [
                                {
                                    "@type": "PropertyValue",
                                    "name": "Color",
                                    "value": varnt.color
                                },
                                {
                                    "@type": "PropertyValue",
                                    "name": "Size",
                                    "value": varnt.size
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
                                        "name": prod.name,
                                        "item": `https://narumugai.com/product/${slug}`
                                    }
                                ]
                            }
                        })
                    }}
                />
                
                <ProductDetails
                    product={productData.product}
                    variant={productData.variant}
                    colors={productData.colors}
                    sizes={productData.sizes}
                    reviewCount={productData.reviewCount}
                />
            </div>
        );
    } catch (error) {
        console.error('Error fetching product data:', error);
        return (
            <div className='flex justify-center items-center py-10 h-[300px]'>
                <h1 className='text-4xl font-semibold'>Product not found.</h1>
            </div>
        );
    }
}

export default ProductPage