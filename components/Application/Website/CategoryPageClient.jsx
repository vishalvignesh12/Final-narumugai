'use client'
import React, { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import axios from 'axios'
import ProductBox from './ProductBox'
import ButtonLoading from '../ButtonLoading'
import Filter from './Filter'
import Sorting from './Sorting'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet"
import useWindowSize from '@/hooks/useWindowSize'

const CategoryPageClient = ({ categoryInfo, categoryType, filterParams }) => {
    const [limit, setLimit] = useState(12)
    const [sorting, setSorting] = useState('default_sorting')
    const [isMobileFilter, setIsMobileFilter] = useState(false)
    const windowSize = useWindowSize()

    const fetchProducts = async (pageParam) => {
        const { data: getProducts } = await axios.get(
            `/api/shop?page=${pageParam}&limit=${limit}&sort=${sorting}&${filterParams}`
        )

        if (!getProducts.success) {
            return { products: [], nextPage: null }
        }

        return getProducts.data
    }

    const { error, data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['category-products', categoryType, limit, sorting, filterParams],
        queryFn: async ({ pageParam }) => await fetchProducts(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage.nextPage
        }
    })

    return (
        <div>
            {/* Hero Section */}
            <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-16 lg:px-32 md:px-8 px-4">
                <div className="max-w-6xl mx-auto text-center">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                        {categoryInfo.title}
                    </h1>
                    <p className="text-xl text-pink-600 font-medium mb-6">
                        {categoryInfo.subtitle}
                    </p>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                        {categoryInfo.description}
                    </p>
                    
                    {/* Features */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
                        {categoryInfo.features.map((feature, index) => (
                            <div key={index} className="bg-white p-3 rounded-lg shadow-sm border">
                                <p className="text-sm text-gray-700 font-medium">{feature}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Subcategories */}
            <section className="py-12 lg:px-32 md:px-8 px-4 bg-white">
                <h2 className="text-2xl lg:text-3xl font-bold text-center text-gray-800 mb-8">
                    Explore Our Collection
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {categoryInfo.subcategories.map((subcategory, index) => (
                        <div key={index} className="bg-gray-50 p-6 rounded-lg hover:shadow-md transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                {subcategory.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-3">
                                {subcategory.description}
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-pink-600 font-semibold">
                                    {subcategory.count} Available
                                </span>
                                <button className="text-pink-600 hover:text-pink-700 font-medium text-sm">
                                    View Collection →
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Products Section */}
            <section className='lg:flex lg:px-32 md:px-8 px-4 my-16 gap-6'>
                {windowSize.width > 1024 ? (
                    <div className='lg:w-72 flex-shrink-0'>
                        <div className='sticky top-4 bg-gray-50 p-4 rounded-lg shadow-sm'>
                            <h3 className="text-lg font-semibold mb-4">Filter Products</h3>
                            <Filter />
                        </div>
                    </div>
                ) : (
                    <Sheet open={isMobileFilter} onOpenChange={() => setIsMobileFilter(false)}>
                        <SheetContent side='left' className="block w-80">
                            <SheetHeader className="border-b pb-4">
                                <SheetTitle className='text-lg font-semibold'>Filter Products</SheetTitle>
                            </SheetHeader>
                            <div className='p-4 overflow-auto h-[calc(100vh-80px)]'>
                                <Filter />
                            </div>
                        </SheetContent>
                    </Sheet>
                )}

                <div className='flex-1 min-w-0'>
                    <Sorting
                        limit={limit}
                        setLimit={setLimit}
                        sorting={sorting}
                        setSorting={setSorting}
                        mobileFilterOpen={isMobileFilter}
                        setMobileFilterOpen={setIsMobileFilter}
                    />

                    {isFetching && <div className='p-4 font-semibold text-center text-gray-600'>Loading products...</div>}
                    {error && <div className='p-4 font-semibold text-center text-red-600'>{error.message}</div>}

                    <div className='grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-8 lg:gap-6 md:gap-4 gap-4 mt-6'>
                        {data && data.pages.map(page => (
                            page.products.map(product => (
                                <ProductBox key={product._id} product={product} />
                            ))
                        ))}
                    </div>

                    {/* Load more button */}
                    <div className='flex justify-center mt-10'>
                        {hasNextPage ? (
                            <ButtonLoading 
                                type="button" 
                                loading={isFetching} 
                                text="Load More Products" 
                                onClick={fetchNextPage} 
                                className='px-8 py-3' 
                            />
                        ) : (
                            <>
                                {!isFetching && data && data.pages[0]?.products?.length > 0 && (
                                    <span className='text-gray-500 text-sm'>You've seen all our amazing {categoryType} sarees!</span>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default CategoryPageClient