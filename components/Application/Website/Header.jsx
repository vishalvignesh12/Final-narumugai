'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { IoIosSearch } from "react-icons/io";
import Cart from './Cart'
import { VscAccount } from "react-icons/vsc";
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import userIcon from '@/public/assets/images/user.png'
import { IoMdClose } from "react-icons/io";
import { usePathname } from 'next/navigation'
import { HiMiniBars3 } from "react-icons/hi2";
import Search from './Search'
import WishlistIcon from './WishlistIcon'


const Header = () => {
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenu, setIsMobileMenu] = useState(false)
    const [showSearch, setShowSearch] = useState(false)
    const pathname = usePathname()
    
    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenu(false)
        setShowSearch(false)
    }, [pathname])
    
    // Close mobile menu when clicking outside or on overlay
    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            setIsMobileMenu(false)
        }
    }
    
    // Close mobile menu and search when pressing Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsMobileMenu(false)
                setShowSearch(false)
            }
        }
        
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])
    
    return (
        
        <div className='bg-white border-b lg:px-32 md:px-8 px-4'>
            <meta name="google-site-verification" content="rlGxKPQZkMKBgxHtyZSOt9UAHlm1WQ9FbmEhAKrMo50" />
            <div className='flex justify-between items-center lg:py-5 py-3'>
                <Link href={WEBSITE_HOME}>
                    <div className='text-center'>
                        <h1 className='lg:text-3xl md:text-2xl text-xl font-bold text-pink-500 lg:mb-1 mb-1'>Narumugai Boutique</h1>
                    </div>
                </Link>

                <div className='hidden lg:block'>
                    <ul className='flex items-center gap-6'>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_HOME} className='block py-2'>Home</Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href="/about-us" className='block py-2'>About</Link>
                        </li>
                        <li className='text-gray-600 hover:text-primary hover:font-semibold'>
                            <Link href={WEBSITE_SHOP} className='block py-2'>Shop</Link>
                        </li>
                    </ul>
                </div>

                <div className='flex items-center gap-10'>
                    <Cart />

                    {auth ? (
                        <Link href={USER_DASHBOARD} className='hover:opacity-80 transition-opacity'>
                            <Avatar className='lg:w-8 lg:h-8 w-7 h-7'>
                                <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                            </Avatar>
                        </Link>
                    ) : (
                        <div className='flex items-center gap-10'>
                            <Link href={WEBSITE_LOGIN} className='text-pink-600 hover:text-primary hover:font-semibold'>
                                Login
                            </Link>
                            <Link href={WEBSITE_REGISTER} className='bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600 transition-colors'>
                                Sign Up
                            </Link>
                        </div>
                    )}

                    <button type='button' className='lg:hidden block p-1 hover:bg-gray-100 rounded transition-colors' onClick={() => setIsMobileMenu(true)} >
                        <HiMiniBars3 size={24} className='text-gray-500 hover:text-primary' />
                    </button>
                </div>
            </div>

            <Search isShow={showSearch} />
        </div>
    )
}

export default Header