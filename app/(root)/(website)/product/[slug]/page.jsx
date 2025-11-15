import React from 'react'
import ProductDetails from './ProductDetails'
import { Metadata } from 'next'
import { getBaseURL } from '@/lib/config'

// Database imports
import { connectDB } from '@/lib/databaseConnection'
import ProductModel from '@/models/Product.model'
import ProductVariantModel from '@/models/ProductVariant.model'
import ReviewModel from '@/models/Review.model'
import MediaModel from '@/models/Media.model' // Ensure model is registered

// Revalidate data
export const revalidate = 300 // Revalidate every 5 minutes
export const dynamicParams = true;

// --- generateMetadata function (No changes, this was fine) ---
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

        const getProduct = await ProductModel.findOne(filter).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

        console.log('Metadata: Product found:', !!getProduct); 

        if (!getProduct) {
            console.error(`Product not found for slug: ${slug}`);
            return {
                title: 'Product Details | Narumugai',
                description: 'Premium saree collection at Narumugai'
            };
        }

        let variant = await ProductVariantModel.findOne({ product: getProduct._id }).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

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

        const reviewCount = await ReviewModel.countDocuments({ product: getProduct._id });

        // --- Metadata return (No changes) ---
        return {
            title: `${getProduct.name} | Premium Saree Online | Narumugai`,
            description: `Buy ${getProduct.name} online at best price. Premium quality saree. Free shipping and easy returns.`,
            // ... (rest of your metadata object)
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
            // ... (rest of your metadata object)
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: 'Product Details | Narumugai',
            description: 'Premium saree collection at Narumugai'
        };
    }
}


// --- ProductPage Component (Main Fix Here) ---
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

        const product = await ProductModel.findOne(filter).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

        console.log('Product found:', !!product); 

        if (!product) {
            console.error(`Product not found for slug: ${slug} in main component`);
            return (
                <div className='flex justify-center items-center py-10 h-[300px]'>
                    <h1 className='text-4xl font-semibold'>Product not found.</h1>
                </div>
            );
        }

        // --- FIX 1: Fetch ALL variants for the client component ---
        const allVariants = await ProductVariantModel.find({ 
            product: product._id,
            deletedAt: null 
        }).populate({
            path: 'media',
            select: 'secure_url',
            model: 'Media'
        }).lean();

        // --- FIX 2: Determine default variant and colors/sizes from ALL variants ---
        let defaultVariant;
        
        if (allVariants.length > 0) {
            defaultVariant = allVariants[0]; // Use the first as default
        } else {
            // Fallback for products with no variants
            defaultVariant = {
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

        // Get colors and sizes from the full list
        const colors = allVariants.length > 0 
            ? [...new Set(allVariants.map(v => v.color))] 
            : ['Default'];
            
        const sizes = allVariants.length > 0
            ? [...new Set(allVariants.map(v => v.size))]
            : ['Default'];

        // get review count 
        const reviewCount = await ReviewModel.countDocuments({ product: product._id });

        // Destructure for structured data
        const prod = product;
        const varnt = defaultVariant; // Use default variant for LD+JSON
        
        return (
            <div>
                {/* Product Structured Data (Using server-fetched data) */}
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
                                "reviewCount": reviewCount || 0
                            },
                            // ... (rest of your structured data)
                        })
                    }}
                />
                
                {/* --- FIX 3: Pass all data as props to the client component --- */}
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