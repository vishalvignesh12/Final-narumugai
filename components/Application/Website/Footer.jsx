import React from 'react'
import Link from 'next/link'
import { IoLocationOutline } from "react-icons/io5";
import { MdOutlinePhone } from "react-icons/md";
import { MdOutlineMail } from "react-icons/md";
import { AiOutlineYoutube } from "react-icons/ai";
import { FaInstagram } from "react-icons/fa";
import { FaWhatsapp } from "react-icons/fa";
import { TiSocialFacebookCircular } from "react-icons/ti";
import { FiTwitter } from "react-icons/fi";

import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
const Footer = () => {
    return (
        <footer className='bg-gray-50 border-t'>
            <div className='grid lg:grid-cols-5 md:grid-cols-2 grid-cols-1 gap-10 py-10 lg:px-32 px-4'>

                <div className='lg:col-span-1 md:col-span-2 col-span-1'>
                    <h1 className='text-4xl font-bold text-pink-500 mb-3'>Narumugai</h1>
                    <p className='text-xs text-gray-400 font-medium mb-2'>Premium Saree Collection</p>
                    <p className='text-gray-500 text-sm'>
                        Narumugai is your premier destination for exquisite sarees. From traditional silk sarees to modern designer collections, we bring you the finest Indian ethnic wear with authentic craftsmanship and timeless elegance.
                    </p>
                </div>

                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Saree Collections</h4>
                    <ul>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/categories/silk-sarees">Silk Sarees</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/categories/cotton-sarees">Cotton Sarees</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/categories/designer-sarees">Designer Sarees</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/categories/wedding-sarees">Wedding Sarees</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/categories/party-wear-sarees">Party Wear Sarees</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/categories/casual-sarees">Casual Sarees</Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Customer Care</h4>
                    <ul>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_REGISTER}>Create Account</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={WEBSITE_LOGIN}>Login</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href={USER_DASHBOARD}>My Account</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/size-guide">Saree Size Guide</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/care-instructions">Saree Care Tips</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/return-policy">Return & Exchange</Link>
                        </li>
                        <li className='mb-2 text-gray-500'>
                            <Link href="/refund-policy">Refund Policy</Link>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className='text-xl font-bold uppercase mb-5'>Visit Our Store</h4>
                    <ul>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <IoLocationOutline size={20} />
                            <span className='text-sm'>Narumugai<br/>No. 426 TI cycles, road<br/>Ambattur, Chennai, Tamil Nadu 600053</span>
                        </li>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <MdOutlinePhone size={20} />
                            <Link href="tel:+91-9884585989" className='hover:text-primary text-sm'>+91-9884585989</Link>
                        </li>
                        <li className='mb-2 text-gray-500 flex gap-2'>
                            <MdOutlineMail size={20} />
                            <Link href="mailto:hello@narumugai.com" className='hover:text-primary text-sm'>hello@narumugai.com</Link>
                        </li>
                    </ul>

                    <div className='mt-6'>
                        <h5 className='text-sm font-semibold text-gray-700 mb-3'>Store Hours</h5>
                        <p className='text-xs text-gray-500'>Monday - Saturday: 10:00 AM - 8:00 PM</p>
                        <p className='text-xs text-gray-500'>Sunday: 11:00 AM - 7:00 PM</p>
                    </div>


                    <div className='flex gap-5 mt-6'>

                        <Link href="https://youtube.com/@narumugaisarees" target="_blank" rel="noopener noreferrer">
                            <AiOutlineYoutube className='text-primary hover:text-pink-700 transition-colors' size={25} />
                        </Link>
                        <Link href="https://instagram.com/narumugaisarees" target="_blank" rel="noopener noreferrer">
                            <FaInstagram className='text-primary hover:text-pink-700 transition-colors' size={25} />
                        </Link>
                        <Link href="https://wa.me/919884585989" target="_blank" rel="noopener noreferrer">
                            <FaWhatsapp className='text-primary hover:text-pink-700 transition-colors' size={25} />
                        </Link>
                        <Link href="https://facebook.com/narumugaisarees" target="_blank" rel="noopener noreferrer">
                            <TiSocialFacebookCircular className='text-primary hover:text-pink-700 transition-colors' size={25} />
                        </Link>
                        <Link href="https://twitter.com/narumugaisarees" target="_blank" rel="noopener noreferrer">
                            <FiTwitter className='text-primary hover:text-pink-700 transition-colors' size={25} />
                        </Link>

                    </div>

                </div>

            </div>


            <div className='py-5 bg-gray-100'>
                <div className='lg:px-32 md:px-8 px-4'>
                    <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                        <p className='text-center text-sm text-gray-600'>
                            © {new Date().getFullYear()} Narumugai Saree Emporium. All Rights Reserved.
                        </p>
                        <div className='flex gap-4 text-xs text-gray-500'>
                            <Link href="/privacy-policy" className='hover:text-primary'>Privacy Policy</Link>
                            <span>|</span>
                            <Link href="/terms-and-conditions" className='hover:text-primary'>Terms & Conditions</Link>
                            <span>|</span>
                            <Link href="/shipping-policy" className='hover:text-primary'>Shipping Policy</Link>
                            <span>|</span>
                            <Link href="/refund-policy" className='hover:text-primary'>Refund Policy</Link>
                        </div>
                    </div>
                </div>
            </div>

        </footer>
    )
}

export default Footer