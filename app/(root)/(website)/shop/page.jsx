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
import { useQuery } from '@tanstack/react-query'
import ProductBox from '@/components/Application/Website/ProductBox'
import ButtonLoading from '@/components/Application/ButtonLoading'
import Head from 'next/head'

const breadcrumb = {
    title: 'Shop Sarees',
    links: [
        { label: 'Shop Sarees', href: WEBSITE_SHOP }
    ]
}

// Saree categories for better navigation
const sareeCategories = [
    { name: 'Silk Sarees', filter: 'silk', description: 'Premium silk sarees for special occasions' },
    { name: 'Cotton Sarees', filter: 'cotton', description: 'Comfortable cotton sarees for daily wear' },
    { name: 'Designer Sarees', filter: 'designer', description: 'Latest designer sarees from top brands' },
    { name: 'Wedding Sarees', filter: 'wedding', description: 'Bridal and wedding collection sarees' },
    { name: 'Party Wear', filter: 'party', description: 'Elegant sarees for parties and events' },
    { name: 'Casual Sarees', filter: 'casual', description: 'Simple and elegant everyday sarees' }
]
const Shop = () => {
    const searchParams = useSearchParams().toString()
    const [limit, setLimit] = useState(9)
    const [sorting, setSorting] = useState('default_sorting')
    const [isMobileFilter, setIsMobileFilter] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState('')
    const windowSize = useWindowSize()


    const fetchProducts = async () => {
        const { data: getProducts } = await axios.get(`/api/shop?page=0&limit=100&sort=${sorting}&${searchParams}`)

        if (!getProducts.success) {
            return { products: [] }
        }

        return getProducts.data
    }

    const { error, data, isFetching } = useQuery({
        queryKey: ['products', limit, sorting, searchParams],
        queryFn: fetchProducts
    })


    return (
        <div>
            <Head>
                <title>Shop Premium Sarees Online | Narumugai Saree Collection</title>
                <meta name="description" content="Discover our exquisite collection of sarees including silk sarees, cotton sarees, designer sarees, and wedding sarees. Premium quality sarees with best prices and fast delivery." />
                <meta name="keywords" content="sarees online, silk sarees, cotton sarees, designer sarees, wedding sarees, party wear sarees, traditional sarees, Indian sarees" />
                <meta property="og:title" content="Shop Premium Sarees Online | Narumugai Saree Collection" />
                <meta property="og:description" content="Discover our exquisite collection of sarees including silk sarees, cotton sarees, designer sarees, and wedding sarees. Premium quality sarees with best prices and fast delivery." />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="Shop Premium Sarees Online | Narumugai Saree Collection" />
                <meta name="twitter:description" content="Discover our exquisite collection of sarees including silk sarees, cotton sarees, designer sarees, and wedding sarees." />
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
                                "description": category.description
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
            
            {/* Hero Section for Saree Shop */}
            <section className="bg-gradient-to-r from-pink-50 to-purple-50 py-12 lg:px-32 md:px-8 px-4">
                <div className="text-center max-w-4xl mx-auto">
                    <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-4">
                        Premium Saree Collection
                    </h1>
                    <p className="text-lg text-gray-600 mb-8">
                        Discover our exquisite range of traditional and contemporary sarees. From elegant silk sarees to comfortable cotton sarees, find the perfect saree for every occasion.
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-8">
                        {sareeCategories.map((category, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedCategory(category.filter)}
                                className={`p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                    selectedCategory === category.filter
                                        ? 'bg-pink-500 text-white shadow-lg'
                                        : 'bg-white text-gray-700 hover:bg-pink-50 hover:text-pink-600 border border-gray-200'
                                }`}
                            >
                                {category.name}
                            </button>
                        ))}
                    </div>
                </div>
            </section>
            <section className='lg:flex lg:px-32 md:px-8 px-4 my-10 lg:my-16 gap-6'>
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
                        {data && data.products && data.products.map(product => (
                            <ProductBox key={product._id} product={product} />
                        ))}
                    </div>

                    {/* Results count */}
                    <div className='flex justify-center mt-10'>
                        {!isFetching && data && data.products && data.products.length > 0 && (
                            <span className='text-gray-500 text-sm'>Showing {data.products.length} products</span>
                        )}
                        {!isFetching && data && data.products && data.products.length === 0 && (
                            <span className='text-gray-500 text-sm'>No products found.</span>
                        )}
                    </div>

                </div>


            </section>
        </div>
    )
}

export default Shop