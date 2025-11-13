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
import { Button } from "@/components/ui/button"; // <-- IMPORT BUTTON

// Saree categories for better navigation
const sareeCategories = [
    { name: 'Silk Sarees', filter: 'silk', description: 'Premium silk sarees for special occasions' },
    { name: 'Cotton Sarees', filter: 'cotton', description: 'Comfortable cotton sarees for daily wear' },
    // ... other categories
];

const Shop = () => {
    const searchParams = useSearchParams().toString();
    const [limit, setLimit] = useState(12);
    const [page, setPage] = useState(1);
    
    const [filterState, setFilterState] = useState({
        categoryFilter: [],
        colorFilter: [],
        sizeFilter: [],
        priceFilter: [],
        // ... other filters
    });
    
    <Head>
        <title>Shop All Sarees - Narumugai</title>
        <meta name_description="Explore our exclusive collection of silk, cotton, and designer sarees. Find the perfect saree for every occasion at Narumugai." />
        <meta name="keywords" content="shop sarees, buy sarees online, silk sarees, cotton sarees, designer sarees, Narumugai" />
    </Head>

    const { data, error, isFetching } = useQuery({
        queryKey: ['shop-products', searchParams, page, limit, filterState], 
        queryFn: async () => {
            const res = await axios.post(`/api/shop`, {
                start: (page - 1) * limit,
                size: limit,
                ...filterState
            });
            
            // --- FIX 1: Return the WHOLE object ---
            // This gives us access to data.products and data.meta
            return res.data; 
        },
        keepPreviousData: true,
        staleTime: 60000 
    });

    const { isMobile } = useWindowSize();

    const handleFilterChange = (newFilters) => {
        setFilterState(newFilters);
        setPage(1); 
    };

    // --- PAGINATION LOGIC ---
    const totalProducts = data?.meta?.totalRowCount || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    const handlePrevPage = () => {
        setPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setPage((prev) => Math.min(prev + 1, totalPages));
    };
    // --- END PAGINATION LOGIC ---

    return (
        <div className='container mx-auto px-4 py-8'>
            <WebsiteBreadcrumb
                items={[
                    { title: "Shop" }, // Fixed: Last item doesn't need href
                ]}
            />
            
            <header className='text-center my-8'>
                <h1 className='text-4xl font-bold mb-2'>Shop Our Collection</h1>
                <p className='text-gray-600 text-lg'>Discover the finest sarees for every occasion.</p>
            </header>

            <section className='mb-8 p-4 bg-gray-50 rounded-lg'>
                <SearchWithFilters 
                    onFilterChange={handleFilterChange} 
                    isMobile={isMobile}
                />
            </section>
            
            <section>
                {isFetching && (
                    <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-6'>
                        {Array.from({ length: limit }).map((_, index) => (
                            <ProductBox.Skeleton key={index} />
                        ))}
                    </div>
                )}

                {error && (
                    <div className='text-center py-12'>
                        <p className='text-red-500 text-lg'>Failed to load products</p>
                        <p className='text-gray-500 text-sm'>{error.message}</p>
                    </div>
                )}
                
                {!isFetching && !error && (
                    <>
                        <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 grid-cols-2 gap-6'>
                            {/* --- FIX 2: Read from data.products --- */}
                            {data && data.products && data.products.map(product => (
                                <ProductBox key={product._id} product={product} showQuickActions={true} />
                            ))}
                        </div>

                        <div className='flex justify-center mt-12'>
                            {/* --- FIX 3: Read from data.products and data.meta --- */}
                            {data && data.products && data.products.length > 0 ? (
                                <span className='text-gray-500 text-sm bg-gray-50 px-4 py-2 rounded-full'>
                                    Showing {data.products.length} of {data.meta.totalRowCount} products
                                </span>
                            ) : (
                                <div className='text-center py-12'>
                                    <p className='text-gray-500 text-lg mb-2'>No products found</p>
                                    <p className='text-gray-400 text-sm'>Try adjusting your search or filters</p>
                                </div>
                            )}
                        </div>

                        {/* --- FIX 4: ADD PAGINATION CONTROLS --- */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button 
                                    onClick={handlePrevPage} 
                                    disabled={page === 1 || isFetching}
                                >
                                    Previous
                                </Button>
                                <span className="text-gray-700">
                                    Page {page} of {totalPages}
                                </span>
                                <Button 
                                    onClick={handleNextPage} 
                                    disabled={page === totalPages || isFetching}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Shop;