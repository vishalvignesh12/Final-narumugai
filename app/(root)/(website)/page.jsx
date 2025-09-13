'use client'
import MainSlider from '@/components/Application/Website/MainSlider'
import React, { useEffect, useState } from 'react'
import FeaturedProduct from '@/components/Application/Website/FeaturedProduct'
import Testimonial from '@/components/Application/Website/Testimonial'

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
            {/* Banners section - kept static for now but can be made dynamic similar to sliders */}
            <section className='lg:px-32 px-4 sm:pt-20 pt-5 pb-10'>
                <div className='grid grid-cols-2 sm:gap-10 gap-2'>
                    <div className='border rounded-lg overflow-hidden'>
                        <a href="#" >
                            <img 
                                src="/assets/images/banner1.png" 
                                alt='banner 1'
                                className='transition-all hover:scale-110 w-full h-auto'
                            />
                        </a>
                    </div>
                    <div className='border rounded-lg overflow-hidden'>
                        <a href="#" >
                            <img 
                                src="/assets/images/banner2.png" 
                                alt='banner 2'
                                className='transition-all hover:scale-110 w-full h-auto'
                            />
                        </a>
                    </div>
                </div>
            </section>

            <FeaturedProduct />

            {/* Advertising banner - kept static for now but can be made dynamic */}
            <section className='sm:pt-20 pt-5 pb-10'>
                <img 
                    src="/assets/images/advertising-banner.png" 
                    alt='Advertisement'
                    className='w-full h-auto'
                />
            </section>

            <Testimonial />

            <section className='lg:px-32 px-4  border-t py-10'>
                <div className='grid lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-10'>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <GiReturnArrow size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>7-Days Returns</h3>
                        <p>Risk-free shopping with easy returns.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <FaShippingFast size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>Free Shipping</h3>
                        <p>No extra costs, just the price you see.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <BiSupport size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>24/7 Support</h3>
                        <p>24/7 support, alway here just for you.</p>
                    </div>
                    <div className='text-center'>
                        <p className='flex justify-center items-center mb-3'>
                            <TbRosetteDiscountFilled size={30} />
                        </p>
                        <h3 className='text-xl font-semibold'>Member Discounts</h3>
                        <p>Special offers for our loyal customers.</p>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Home