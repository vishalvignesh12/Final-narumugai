import React from 'react'
import ProductDetails from './ProductDetails'
import { Metadata } from 'next'
import { getBaseURL } from '@/lib/config'

// Database imports
import { connectDB } from '@/lib/databaseConnection'
import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'
import ReviewModel from '@/models/Review.model'

// Import Media model to ensure it's registered with Mongoose
import MediaModel from '@/models/Media.model'

// Revalidate data
export const revalidate = 300 // Revalidate every 5 minutes
export const dynamicParams = true;

export async function generateMetadata({ params }) {
    const { slug } = params;
    
    console.log('Metadata params slug:', slug); 

    try {
        await connectDB();

        const filter = {
            deletedAt: null,
            slug: slug
        };

        console.log('Metadata: Querying product with filter:', filter); 

        // Get product data
        const getProductData = await ProductModel.findOne(filter).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

        console.log('Metadata: Product found:', !!getProductData); 

        if (!getProductData) {
            console.error(`Product not found for slug: ${slug}`);
            return {
                title: 'Product Details | Narumugai',
                description: 'Premium saree collection at Narumugai'
            };
        }

        // Get variant data
        let variantData = await ProductVariantModel.findOne({ product: getProductData._id }).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

        // --- FIX: Serialize data to plain objects ---
        const getProduct = JSON.parse(JSON.stringify(getProductData));
        let variant = JSON.parse(JSON.stringify(variantData));
        // --- END FIX ---

        // If no variant found, create a fallback variant
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

        // Return metadata 
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
    
    console.log('Product page params slug:', slug); 

    try {
        await connectDB();

        const filter = {
            deletedAt: null,
            slug: slug
        };

        console.log('Querying product with filter:', filter);

        // Get product data
        const productData = await ProductModel.findOne(filter).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

        console.log('Product found:', !!productData); 

        if (!productData) {
            console.error(`Product not found for slug: ${slug} in main component`);
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Product not found.</h1>
                </div>
            );
        }

        // Get all variants data
        const allVariantsData = await ProductVariantModel.find({ 
            product: productData._id,
            deletedAt: null 
        }).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

        // Determine default variant
        let defaultVariantData;
        
        if (allVariantsData.length > 0) {
            defaultVariantData = allVariantsData[0]; // Use the first as default
        } else {
            // Fallback for products with no variants
            defaultVariantData = {
                _id: null,
                product: productData._id,
                color: 'Default',
                size: 'Default',
                mrp: productData.mrp,
                sellingPrice: productData.sellingPrice,
                discountPercentage: productData.discountPercentage,
                quantity: productData.quantity || 0,
                media: productData.media || []
            };
        }

        // get review count 
        const reviewCount = await ReviewModel.countDocuments({ product: productData._id });

        // --- FIX: Serialize all data before passing to client component ---
        const product = JSON.parse(JSON.stringify(productData));
        const allVariants = JSON.parse(JSON.stringify(allVariantsData));
        const defaultVariant = JSON.parse(JSON.stringify(defaultVariantData));
        // --- END FIX ---

        // Get colors and sizes from the plain 'allVariants' object
        const colors = allVariants.length > 0 
            ? [...new Set(allVariants.map(v => v.color))] 
            : ['Default'];
            
        const sizes = allVariants.length > 0
            ? [...new Set(allVariants.map(v => v.size))]
            : ['Default'];
        
        // Destructure the plain data for use in structured data script
        const prod = product;
        const varnt = defaultVariant;
        
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
                                "ratingValue": "4.5", // You might want to fetch this dynamically
                                "reviewCount": reviewCount || 0
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
                                    "value": "Premium Fabric" // You might want to make this dynamic
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
                
                {/* Pass the plain, serialized data to the client component */}
                <ProductDetails
                    product={product}
                    defaultVariant={defaultVariant}
                    allVariants={allVariants}
                    colors={colors}
                    sizes={sizes}
                    reviewCount={reviewCount}
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