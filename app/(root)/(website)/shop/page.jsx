"use client"
import React, { useState, useEffect } from 'react';
import SearchWithFilters from '@/components/Application/Website/SearchWithFilters';
import ProductBox from '@/components/Application/Website/ProductBox';
import ButtonLoading from '@/components/Application/ButtonLoading';
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb';
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Head from 'next/head';
import useWindowSize from '@/hooks/useWindowSize';
import useFetch from '@/hooks/useFetch';

// Saree categories for better navigation
const sareeCategories = [
    { name: 'Silk Sarees', filter: 'silk', description: 'Premium silk sarees for special occasions' },
    { name: 'Cotton Sarees', filter: 'cotton', description: 'Comfortable cotton sarees for daily wear' },
    { name: 'Designer Sarees', filter: 'designer', description: 'Latest designer sarees from top brands' },
    { name: 'Wedding Sarees', filter: 'wedding', description: 'Bridal and wedding collection sarees' },
    { name: 'Party Wear', filter: 'party', description: 'Elegant sarees for parties and events' },
    { name: 'Casual Sarees', filter: 'casual', description: 'Simple and elegant everyday sarees' }
];

const Shop = () => {
    const searchParams = useSearchParams().toString();
    const [limit, setLimit] = useState(9);
    const [sorting, setSorting] = useState('category_sorting');
    const [isMobileFilter, setIsMobileFilter] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('');
    const windowSize = useWindowSize();
    
    // Use optional chaining to safely access the width property
    const isMobile = windowSize?.width <= 768;

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileFilter(false);
        setSelectedCategory('');
    }, [searchParams]);

    // Close mobile menu and search when pressing Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsMobileFilter(false);
                setSelectedCategory('');
            }
        };
        
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const fetchProducts = async () => {
        const { data: getProducts } = await axios.get(`/api/shop?page=0&limit=100&sort=${sorting}&${searchParams}`);

        if (!getProducts.success) {
            return { products: [] };
        }

        return getProducts.data;
    };

    const { error, data, isFetching } = useQuery({
        queryKey: ['products', limit, sorting, searchParams],
        queryFn: fetchProducts
    });

    // Define breadcrumb data structure
    const breadcrumb = {
        title: 'Shop Sarees',
        links: [
            {
                label: 'Home',
                href: 'https://narumugai.com'
            },
            {
                label: 'Shop Sarees',
                href: 'https://narumugai.com/shop'
            }
        ]
    };

    return (
        <div>
            <Head>
                <title>Shop Premium Sarees Online | Narumugai Saree Collection</title>
                <meta name="description" content="Discover our exquisite collection of sarees including silk sarees, cotton sarees, designer sarees, and wedding sarees." />
                <link rel="canonical" href="https://narumugai.com/shop" />
            </Head>
            
            {/* Structured Data for Saree Collection */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        "name": "Saree Collection - Narumugai",
                        "description": "Premium collection of sarees including silk, cotton, designer and wedding sarees",
                        "url": "https://narumugai.com/shop",
                        "mainEntity": {
                            "@type": "ItemList",
                            "name": "Saree Categories",
                            "itemListElement": sareeCategories.map((category, index) => ({
                                "@type": "ListItem",
                                "position": index + 1,
                                "name": category.name,
                                "description": category.description,
                                "url": `https://narumugai.com/shop?category=${category.filter}`
                            }))
                        },
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
                                }
                            ]
                        }
                    })
                }}
            />
            
            <WebsiteBreadcrumb props={breadcrumb} />
            
            <SearchWithFilters />
            
            {/* Products Section */}
            <section className='max-w-7xl mx-auto px-4 md:px-8 lg:px-12 my-10 lg:my-16'>
                {isFetching && (
                    <div className='flex justify-center items-center py-12'>
                        <div className='text-center'>
                            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2'></div>
                            <p className='text-gray-600'>Loading products...</p>
                        </div>
                    </div>
                )}
                
                {error && (
                    <div className='flex justify-center items-center py-12'>
                        <div className='text-center text-red-600'>
                            <p className='font-semibold'>{error.message}</p>
                        </div>
                    </div>
                )}
                
                {!isFetching && !error && (
                    <>
                        <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-6'>
                            {data && data.products && data.products.map(product => (
                                <ProductBox key={product._id} product={product} showQuickActions={true} />
                            ))}
                        </div>

                        {/* Results count */}
                        <div className='flex justify-center mt-12'>
                            {data && data.products && data.products.length > 0 ? (
                                <span className='text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full'>
                                    Showing {data.products.length} products
                                </span>
                            ) : (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 text-lg mb-2'>No products found</p>
                                    <p className='text-gray-400 text-sm'>Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </section>
        </div>
    );
};

export default Shop;