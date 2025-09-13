'use client'
import axios from 'axios';
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { IoIosArrowRoundForward } from "react-icons/io";
import ProductBox from './ProductBox';

const FeaturedProduct = () => {
    const [productData, setProductData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/api/product/get-featured-product`)
                setProductData(data)
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        fetchProducts()
    }, [])

    if (loading) {
        return (
            <section className='lg:px-32 md:px-8 px-4 sm:py-10 py-6'>
                <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-5 gap-4'>
                    <h2 className='lg:text-4xl md:text-3xl sm:text-2xl text-xl font-semibold'>Featured Products</h2>
                    <Link href="" className='flex items-center gap-2 underline underline-offset-4 hover:text-primary text-sm sm:text-base'>
                        View All
                        <IoIosArrowRoundForward />
                    </Link>
                </div>
                <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 xl:gap-8 lg:gap-6 md:gap-4 gap-3'>
                    {[...Array(8)].map((_, index) => (
                        <div key={index} className='rounded-lg border overflow-hidden animate-pulse'>
                            <div className='w-full xl:h-[300px] lg:h-[280px] md:h-[250px] sm:h-[200px] h-[150px] bg-gray-200'></div>
                            <div className="p-3 border-t">
                                <div className='h-4 bg-gray-200 rounded mb-2'></div>
                                <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        )
    }

    if (!productData) return null

    return (
        <section className='lg:px-32 md:px-8 px-4 sm:py-10 py-6'>
            <div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4'>
                <h2 className='lg:text-4xl md:text-3xl sm:text-2xl text-xl font-semibold'>Featured Products</h2>
                <Link href="" className='flex items-center gap-2 underline underline-offset-4 hover:text-primary transition-colors text-sm sm:text-base'>
                    View All
                    <IoIosArrowRoundForward />
                </Link>
            </div>
            <div className='grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-3 sm:grid-cols-2 grid-cols-2 xl:gap-8 lg:gap-6 md:gap-4 gap-3'>
                {!productData.success && <div className='col-span-full text-center py-10 text-gray-500'>Data Not Found.</div>}

                {productData.success && productData.data.map((product) => (
                    <ProductBox key={product._id} product={product} />
                ))}
            </div>
        </section>
    )
}

export default FeaturedProduct