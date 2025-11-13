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
    const [limit, setLimit] = useState(12); // Default to 12 products per page
    const [page, setPage] = useState(1);
    
    // Example state for filters (replace with your actual filter logic)
    const [filterState, setFilterState] = useState({
        categoryFilter: [],
        colorFilter: [],
        sizeFilter: [],
        priceFilter: [],
        // ... other filters
    });
    
    // SEO Head (optional but recommended)
    <Head>
        <title>Shop All Sarees - Narumugai</title>
        <meta name_description="Explore our exclusive collection of silk, cotton, and designer sarees. Find the perfect saree for every occasion at Narumugai." />
        <meta name="keywords" content="shop sarees, buy sarees online, silk sarees, cotton sarees, designer sarees, Narumugai" />
    </Head>

    const { data, error, isFetching } = useQuery({
        queryKey: ['shop-products', searchParams, page, limit, filterState], // Add dependencies
        queryFn: async () => {
            const res = await axios.post(`/api/shop`, {
                start: (page - 1) * limit,
                size: limit,
                ...filterState
            });
            
            // This line is correct and returns the product array
            return res.data.data; 
        },
        keepPreviousData: true,
        staleTime: 60000 // Cache data for 1 minute
    });

    const { isMobile } = useWindowSize();

    // Example handler for filters
    const handleFilterChange = (newFilters) => {
        setFilterState(newFilters);
        setPage(1); // Reset to first page on filter change
    };

    return (
        <div className='container mx-auto px-4 py-8'>
            <WebsiteBreadcrumb
                items={[
                    { title: "Shop", href: WEBSITE_SHOP.href },
                ]}
            />
            
            <header className='text-center my-8'>
                <h1 className='text-4xl font-bold mb-2'>Shop Our Collection</h1>
                <p className='text-gray-600 text-lg'>Discover the finest sarees for every occasion.</p>
            </header>

            {/* Filter and Search Section */}
            <section className='mb-8 p-4 bg-gray-50 rounded-lg'>
                <SearchWithFilters 
                    onFilterChange={handleFilterChange} 
                    isMobile={isMobile}
                />
            </section>
            
            {/* Product Grid Section */}
            <section>
                {/* Loading Skeleton */}
                {isFetching && (
                    <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-6'>
                        {Array.from({ length: limit }).map((_, index) => (
                            <ProductBox.Skeleton key={index} />
                        ))}
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className='text-center py-12'>
                        <p className='text-red-500 text-lg'>Failed to load products</p>
                        <p className='text-gray-500 text-sm'>{error.message}</p>
                    </div>
                )}
                
                {!isFetching && !error && (
                    <>
                        <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-6'>
                            {/* --- FIX 1 --- */}
                            {data && data.map(product => (
                                <ProductBox key={product._id} product={product} showQuickActions={true} />
                            ))}
                        </div>

                        {/* Results count */}
                        <div className='flex justify-center mt-12'>
                            {/* --- FIX 2 --- */}
                            {data && data.length > 0 ? (
                                <span className='text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full'>
                                    {/* --- FIX 3 --- */}
                                    Showing {data.length} products
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