import React from 'react'
import Link from 'next/link'
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlinePhone } from "react-icons/md";
import { MdOutlineMail } from "react-icons/md";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { TiSocialFacebookCircular } from "react-icons/ti";

import { USER_DASHBOARD, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_RETURN_POLICY } from '@/routes/WebsiteRoute'

const Footer = () => {
    return (
        <footer className='bg-white border-t border-gray-200'>
            {/* Main Footer Content */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 py-16">
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12'>

                        {/* Brand Info */}
                        <div className='lg:col-span-2 space-y-4'>
                            <div className="flex items-center space-x-2">
                                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">N</span>
                                </div>
                                <h1 className='text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent'>
                                    Narumugai Boutique
                                </h1>
                            </div>
                            <p className='text-gray-600 text-base leading-relaxed'>
                                Your premier destination for exquisite sarees. From traditional silk sarees to modern designer collections, we bring you the finest Indian ethnic wear with authentic craftsmanship and timeless elegance.
                            </p>
                            
                            {/* Social Media */}
                            <div className='flex space-x-4 mt-6'>
                                <Link 
                                    href="https://instagram.com/txt" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100"
                                    aria-label="Instagram"
                                >
                                    <FaInstagram className='text-pink-500' size={20} />
                                </Link>
                                <Link 
                                    href="https://wa.me/919884585989" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100"
                                    aria-label="WhatsApp"
                                >
                                    <FaWhatsapp className='text-green-500' size={20} />
                                </Link>
                                <Link 
                                    href="https://facebook.com/txt" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="p-3 bg-white rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100"
                                    aria-label="Facebook"
                                >
                                    <TiSocialFacebookCircular className='text-blue-600' size={24} />
                                </Link>
                            </div>
                        </div>

                        {/* Saree Collections */}
                        

                        {/* Customer Care */}
                        <div>
                            <h4 className='text-lg font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200'>Customer Care</h4>
                            <ul className='space-y-3'>
                                {[
                                    { name: 'Create Account', link: WEBSITE_REGISTER },
                                    { name: 'Login', link: WEBSITE_LOGIN },
                                    { name: 'My Account', link: USER_DASHBOARD },
                                    { name: 'Return & Exchange', link: WEBSITE_RETURN_POLICY },
                                    { name: 'Refund Policy', link: '/refund-policy' }
                                ].map((item, index) => (
                                    <li key={index}>
                                        <Link 
                                            href={item.link}
                                            className="text-gray-600 hover:text-pink-600 transition-colors duration-200 block py-1"
                                        >
                                            {item.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact Info */}
                        <div>
                            <h4 className='text-lg font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200'>Contact Us</h4>
                            <div className='space-y-4'>
                                <div className='flex items-start space-x-3'>
                                    <div className="p-2 bg-pink-100 rounded-lg mt-1">
                                        <IoLocationOutline className="text-pink-600" size={20} />
                                    </div>
                                    <div className='text-gray-600 text-sm leading-relaxed'>
                                        <p className="font-medium text-gray-800">Our Store</p>
                                        <p>Narumugai botique</p>
                                        <p>No. 426,1st Floor, TI cycles road</p>
                                        <p>Ambattur, Chennai, Tamil Nadu 600053</p>
                                    </div>
                                </div>
                                
                                <div className='flex items-center space-x-3'>
                                    <div className="p-2 bg-green-100 rounded-lg">
                                        <MdOutlinePhone className="text-green-600" size={20} />
                                    </div>
                                    <Link href="tel:+91-9884585989" className="text-gray-600 hover:text-green-600 transition-colors">
                                        +91-9884585989
                                    </Link>
                                </div>
                                
                                <div className='flex items-center space-x-3'>
                                    <div className="p-2 bg-blue-100 rounded-lg">
                                        <MdOutlineMail className="text-blue-600" size={20} />
                                    </div>
                                    <Link href="mailto:hello@narumugai.com" className="text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[150px]">
                                        narumugaiambattur@gmail.com
                                    </Link>
                                </div>

                                <div className='pt-4'>
                                    <h5 className='text-sm font-semibold text-gray-700 mb-2'>Store Hours</h5>
                                    <div className='text-xs text-gray-500 space-y-1'>
                                        <p>Mon-Sun: 11:00 AM - 8:00 PM</p>
                                        
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Bottom Footer */}
            <div className='bg-gray-900 py-8'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex flex-col md:flex-row justify-between items-center gap-6'>
                        <p className='text-center md:text-left text-sm text-gray-300'>
                            © {new Date().getFullYear()} Narumugai Saree Emporium. All Rights Reserved.
                        </p>
                        <div className='flex flex-wrap justify-center gap-4 text-xs text-gray-400'>
                            {[
                                { name: 'Privacy Policy', link: '/privacy-policy' },
                                { name: 'Terms & Conditions', link: '/terms-and-conditions' },
                                { name: 'Shipping Policy', link: '/shipping-policy' },
                                { name: 'Refund Policy', link: '/refund-policy' }
                            ].map((item, index, arr) => (
                                <React.Fragment key={index}>
                                    <Link 
                                        href={item.link}
                                        className="hover:text-pink-400 transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                    {index < arr.length - 1 && <span className="hidden md:block">|</span>}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer