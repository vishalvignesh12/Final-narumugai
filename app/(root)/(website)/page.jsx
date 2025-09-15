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
    // Structured data for homepage
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Narumugai - Premium Sarees Online",
        "description": "Shop exquisite collection of traditional and designer sarees",
        "url": "https://narumugai.com",
        "mainEntity": {
            "@type": "ItemList",
            "name": "Saree Categories",
            "itemListElement": [
                {
                    "@type": "Product",
                    "name": "Silk Sarees",
                    "category": "Traditional Wear"
                },
                {
                    "@type": "Product", 
                    "name": "Cotton Sarees",
                    "category": "Casual Wear"
                },
                {
                    "@type": "Product",
                    "name": "Designer Sarees", 
                    "category": "Premium Wear"
                }
            ]
        }
    };

    return (
        <>
            {/* Structured Data */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            
            {/* Hero Section */}
            <section aria-label="Featured saree collections">
                <MainSlider />
            </section>
            
            {/* SEO Content Section */}
            <section className='lg:px-32 md:px-8 px-4 py-12 bg-gray-50'>
                <div className='text-center max-w-4xl mx-auto'>
                    <h1 className='lg:text-4xl md:text-3xl text-2xl font-bold mb-6 text-gray-800'>
                        Premium Sarees Online - Traditional Indian Elegance
                    </h1>
                    <p className='lg:text-lg text-base text-gray-600 mb-8 leading-relaxed'>
                        Discover the finest collection of <strong>traditional sarees</strong>, <strong>silk sarees</strong>, and <strong>designer sarees</strong> at Narumugai. 
                        From elegant Kanchipuram silk to beautiful cotton sarees, we bring you authentic Indian craftsmanship with modern convenience. 
                        Shop with confidence - authentic products, best prices, and fast delivery across India.
                    </p>
                </div>
            </section>
            
            {/* Dynamic Banners section */}
            <DynamicBanners position="homepage-top" maxBanners={2} />

            <FeaturedProduct />

            {/* Dynamic Advertising banner */}
            <DynamicBanners position="homepage-middle" maxBanners={1} />

            {/* Saree Categories Section */}
            <section className='lg:px-32 md:px-8 px-4 py-16' aria-label="Saree categories">
                <div className='text-center mb-12'>
                    <h2 className='lg:text-3xl md:text-2xl text-xl font-bold mb-4'>Shop by Saree Types</h2>
                    <p className='text-gray-600'>Explore our curated collection of traditional and contemporary sarees</p>
                </div>
                <div className='grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-8'>
                    <div className='text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow'>
                        <h3 className='text-xl font-semibold mb-3 text-primary'>Silk Sarees</h3>
                        <p className='text-gray-600 mb-4'>Luxurious Kanchipuram, Banarasi, and Mysore silk sarees for special occasions</p>
                        <a href='/shop?category=silk-sarees' className='text-primary font-medium hover:underline'>Shop Silk Sarees →</a>
                    </div>
                    <div className='text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow'>
                        <h3 className='text-xl font-semibold mb-3 text-primary'>Cotton Sarees</h3>
                        <p className='text-gray-600 mb-4'>Comfortable and breathable cotton sarees perfect for daily wear and festivals</p>
                        <a href='/shop?category=cotton-sarees' className='text-primary font-medium hover:underline'>Shop Cotton Sarees →</a>
                    </div>
                    <div className='text-center p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow'>
                        <h3 className='text-xl font-semibold mb-3 text-primary'>Designer Sarees</h3>
                        <p className='text-gray-600 mb-4'>Contemporary designs meeting traditional elegance for modern women</p>
                        <a href='/shop?category=designer-sarees' className='text-primary font-medium hover:underline'>Shop Designer Sarees →</a>
                    </div>
                </div>
            </section>

            <Testimonial />

            {/* Trust & Service Features */}
            <section className='lg:px-32 md:px-8 px-4 border-t lg:py-12 md:py-10 py-8' aria-label="Our services">
                <div className='text-center mb-10'>
                    <h2 className='lg:text-2xl text-xl font-bold mb-2'>Why Choose Narumugai for Sarees?</h2>
                    <p className='text-gray-600'>Your trusted partner for authentic Indian sarees</p>
                </div>
                <div className='grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 xl:gap-12 lg:gap-10 gap-8'>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <GiReturnArrow size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>7-Days Returns</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>Risk-free saree shopping with easy returns and exchanges.</p>
                    </div>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <FaShippingFast size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>Free Shipping</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>Free delivery across India on all saree orders above ₹999.</p>
                    </div>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <BiSupport size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>24/7 Support</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>Expert assistance for saree selection and styling advice.</p>
                    </div>
                    <div className='text-center p-4 rounded-lg hover:shadow-md transition-shadow'>
                        <p className='flex justify-center items-center mb-4'>
                            <TbRosetteDiscountFilled size={30} className='text-primary' />
                        </p>
                        <h3 className='lg:text-xl text-lg font-semibold mb-2'>Authentic Quality</h3>
                        <p className='text-gray-600 text-sm lg:text-base'>100% authentic sarees sourced directly from weavers and artisans.</p>
                    </div>
                </div>
            </section>

        </>
    )
}

export default Home