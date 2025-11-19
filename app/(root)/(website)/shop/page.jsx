"use client"
import React, { useState, useEffect } from 'react';
import SearchWithFilters from '@/components/Application/Website/SearchWithFilters';
import ProductBox from '@/components/Application/Website/ProductBox';
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import useWindowSize from '@/hooks/useWindowSize';
import { Button } from "@/components/ui/button";

const Shop = () => {
    // --- FIX 1: Correctly initialize search params ---
    const searchParamsObj = useSearchParams();
    const searchParamsString = searchParamsObj.toString();
    const searchQuery = searchParamsObj.get('q') || ""; // Extract the 'q' param

    const [limit, setLimit] = useState(12);
    const [page, setPage] = useState(1);
    
    const [filterState, setFilterState] = useState({
        categoryFilter: [],
        priceFilter: [],
        // removed color/size based on previous context, add back if needed
    });
    
    const { data, error, isFetching } = useQuery({
        // Include searchParamsString in key to re-fetch when URL changes
        queryKey: ['shop-products', searchParamsString, page, limit, filterState], 
        queryFn: async () => {
            const res = await axios.post(`/api/shop`, {
                start: (page - 1) * limit,
                size: limit,
                globalFilter: searchQuery, // --- FIX 2: Pass the search query to API ---
                ...filterState
            });
            return res.data; 
        },
        keepPreviousData: true,
        staleTime: 60000 
    });

    const { isMobile } = useWindowSize();

    const handleFilterChange = (newFilterPiece) => {
        // Merge logic from previous fixes
        setFilterState(prevState => ({
            ...prevState,
            ...newFilterPiece
        }));
        setPage(1); 
    };

    const totalProducts = data?.meta?.totalRowCount || 0;
    const totalPages = Math.ceil(totalProducts / limit);

    const handlePrevPage = () => {
        setPage((prev) => Math.max(prev - 1, 1));
    };

    const handleNextPage = () => {
        setPage((prev) => Math.min(prev + 1, totalPages));
    };

    return (
        <div className='container mx-auto px-4 py-8'>
            <WebsiteBreadcrumb items={[{ title: "Shop" }]} />
            
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
                            {data && data.products && data.products.map(product => (
                                <ProductBox key={product._id} product={product} showQuickActions={true} />
                            ))}
                        </div>

                        <div className='flex justify-center mt-12'>
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

                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-8">
                                <Button onClick={handlePrevPage} disabled={page === 1 || isFetching} variant="outline">Previous</Button>
                                <span className="text-gray-700 font-medium">Page {page} of {totalPages}</span>
                                <Button onClick={handleNextPage} disabled={page === totalPages || isFetching} variant="outline">Next</Button>
                            </div>
                        )}
                    </>
                )}
            </section>
        </div>
    );
};

export default Shop;