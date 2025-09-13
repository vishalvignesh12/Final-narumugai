'use client'
import Filter from '@/components/Application/Website/Filter'
import Sorting from '@/components/Application/Website/Sorting'
import WebsiteBreadcrumb from '@/components/Application/Website/WebsiteBreadcrumb'
import { WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import React, { useState } from 'react'
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import useWindowSize from '@/hooks/useWindowSize'
import axios from 'axios'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import ProductBox from '@/components/Application/Website/ProductBox'
import ButtonLoading from '@/components/Application/ButtonLoading'
const breadcrumb = {
    title: 'Shop',
    links: [
        { label: 'Shop', href: WEBSITE_SHOP }
    ]
}
const Shop = () => {
    const searchParams = useSearchParams().toString()
    const [limit, setLimit] = useState(9)
    const [sorting, setSorting] = useState('default_sorting')
    const [isMobileFilter, setIsMobileFilter] = useState(false)
    const windowSize = useWindowSize()


    const fetchProduct = async (pageParam) => {
        const { data: getProduct } = await axios.get(`/api/shop?page=${pageParam}&limit=${limit}&sort=${sorting}&${searchParams}`)

        if (!getProduct.success) {
            return
        }

        return getProduct.data
    }

    const { error, data, isFetching, fetchNextPage, hasNextPage } = useInfiniteQuery({
        queryKey: ['products', limit, sorting, searchParams],
        queryFn: async ({ pageParam }) => await fetchProduct(pageParam),
        initialPageParam: 0,
        getNextPageParam: (lastPage) => {
            return lastPage.nextPage
        }
    })


    return (
        <div >
            <WebsiteBreadcrumb props={breadcrumb} />
            <section className='lg:flex lg:px-32 md:px-8 px-4 my-10 lg:my-20 gap-6'>
                {windowSize.width > 1024 ?

                    <div className='lg:w-72 flex-shrink-0'>
                        <div className='sticky top-4 bg-gray-50 p-4 rounded-lg shadow-sm'>
                            <Filter />
                        </div>
                    </div>
                    :

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

                }


                <div className='flex-1 min-w-0'>
                    <Sorting
                        limit={limit}
                        setLimit={setLimit}
                        sorting={sorting}
                        setSorting={setSorting}
                        mobileFilterOpen={isMobileFilter}
                        setMobileFilterOpen={setIsMobileFilter}
                    />

                    {isFetching && <div className='p-4 font-semibold text-center text-gray-600'>Loading...</div>}
                    {error && <div className='p-4 font-semibold text-center text-red-600'>{error.message}</div>}

                    <div className='grid xl:grid-cols-3 lg:grid-cols-2 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 xl:gap-8 lg:gap-6 md:gap-4 gap-4 mt-6'>
                        {data && data.pages.map(page => (
                            page.products.map(product => (
                                <ProductBox key={product._id} product={product} />
                            ))
                        ))}
                    </div>

                    {/* load more button  */}

                    <div className='flex justify-center mt-10'>
                        {hasNextPage ?
                            <ButtonLoading type="button" loading={isFetching} text="Load More" onClick={fetchNextPage} className='px-8 py-3' />
                            :
                            <>
                                {!isFetching && data && data.pages[0]?.products?.length > 0 && 
                                    <span className='text-gray-500 text-sm'>No more products to load.</span>
                                }
                            </>
                        }
                    </div>

                </div>


            </section>
        </div>
    )
}

export default Shop