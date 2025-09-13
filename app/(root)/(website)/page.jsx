'use client'
import MainSlider from '@/components/Application/Website/MainSlider'
import React, { useEffect, useState } from 'react'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import Testimonial from '@/components/Application/Website/Testimonial'
import DynamicBanners from '@/components/Application/Website/DynamicBanners'

import { GiReturnArrow } from "react-icons/gi";
import { FaShippingFast } from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { TbRosetteDiscountFilled } from "react-icons/tb";

const Home = () => {
    return (
        <>
            <section>
                <MainSlider />
            </section>
            
            {/* Dynamic Banners section */}
            <DynamicBanners position="homepage-top" maxBanners={2} />

            <FeaturedProduct />

            {/* Dynamic Advertising banner */}
            <DynamicBanners position="homepage-middle" maxBanners={1} />

            <Testimonial />

            <section className='lg:px-32 md:px-8 px-4 border-t lg:py-12 md:py-10 py-8'>
                <div className='grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 xl:gap-12 lg:gap-10 gap-8'>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <GiReturnArrow size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>7-Days Returns</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>Risk-free shopping with easy returns.</p>
                    </div>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <FaShippingFast size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>Free Shipping</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>No extra costs, just the price you see.</p>
                    </div>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <BiSupport size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>24/7 Support</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>24/7 support, always here just for you.</p>
                    </div>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <TbRosetteDiscountFilled size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>Member Discounts</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>Special offers for our loyal customers.</p>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Home