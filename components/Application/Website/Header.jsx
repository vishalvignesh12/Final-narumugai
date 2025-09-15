'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_SHOP } from '@/routes/WebsiteRoute'
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
            <div className='flex justify-between items-center lg:py-5 py-3'>
                <Link href={WEBSITE_HOME}>
                    <div className='text-center'>
                        <h1 className='lg:text-4xl md:text-3xl text-2xl font-bold text-pink-500 lg:mb-1 mb-1'>Narumugai</h1>
                        <p className='text-xs text-gray-500 font-medium hidden lg:block'>Premium Saree Collection</p>
                    </div>
                </Link>

                <div className='flex justify-between lg:gap-20 md:gap-10 gap-5'>
                    {/* Mobile overlay */}
                    {isMobileMenu && (
                        <div 
                            className="lg:hidden fixed inset-0 bg-black/50 z-40" 
                            onClick={handleOverlayClick}
                        />
                    )}
                    
                    <nav className={`lg:relative lg:w-auto lg:h-auto lg:top-0 lg:left-0 lg:p-0 lg:bg-transparent bg-white fixed z-50 top-0 w-full h-screen transition-all duration-300 ease-in-out ${isMobileMenu ? 'left-0' : '-left-full'}`}>


                        <div className='lg:hidden flex justify-between items-center bg-gray-50 py-4 border-b px-4'>
                            <div>
                                <h1 className='text-2xl font-bold text-pink-500'>Narumugai</h1>
                                <p className='text-xs text-gray-500 font-medium'>Premium Saree Collection</p>
                            </div>

                            <button type='button' onClick={() => setIsMobileMenu(false)} className='p-2 hover:bg-gray-200 rounded-full transition-colors'>
                                <IoMdClose size={24} className='text-gray-500 hover:text-primary' />
                            </button>

                        </div>


                        <ul className='lg:flex justify-between items-center lg:gap-10 gap-0 lg:px-0 px-4 lg:py-0 py-5'>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold border-b lg:border-b-0 border-gray-100'>
                                <Link href={WEBSITE_HOME} className='block lg:py-2 py-4 lg:text-base text-lg' onClick={() => setIsMobileMenu(false)}>
                                    Home
                                </Link>
                            </li>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold border-b lg:border-b-0 border-gray-100'>
                                <Link href="/about-us" className='block lg:py-2 py-4 lg:text-base text-lg' onClick={() => setIsMobileMenu(false)}>
                                    About
                                </Link>
                            </li>
                            <li className='text-gray-600 hover:text-primary hover:font-semibold border-b lg:border-b-0 border-gray-100'>
                                <Link href={WEBSITE_SHOP} className='block lg:py-2 py-4 lg:text-base text-lg' onClick={() => setIsMobileMenu(false)}>
                                    Shop
                                </Link>
                            </li>
                        </ul>
                    </nav>


                    <div className='flex justify-between items-center lg:gap-8 md:gap-6 gap-4'>
                        <button type='button' onClick={() => setShowSearch(!showSearch)} className='p-1 hover:bg-gray-100 rounded transition-colors'>
                            <IoIosSearch
                                className='text-gray-500 hover:text-primary cursor-pointer'
                                size={24}
                            />
                        </button>

                        <Cart />

                        {!auth
                            ?
                            <Link href={WEBSITE_LOGIN} className='p-1 hover:bg-gray-100 rounded transition-colors' onClick={() => setIsMobileMenu(false)}>
                                <VscAccount
                                    className='text-gray-500 hover:text-primary cursor-pointer'
                                    size={24}
                                />
                            </Link>
                            :

                            <Link href={USER_DASHBOARD} className='hover:opacity-80 transition-opacity' onClick={() => setIsMobileMenu(false)}>
                                <Avatar className='lg:w-8 lg:h-8 w-7 h-7'>
                                    <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                                </Avatar>
                            </Link>

                        }


                        <button type='button' className='lg:hidden block p-1 hover:bg-gray-100 rounded transition-colors' onClick={() => setIsMobileMenu(true)} >
                            <HiMiniBars3 size={24} className='text-gray-500 hover:text-primary' />
                        </button>

                    </div>

                </div>

            </div>

            <Search isShow={showSearch} />

        </div>
    )
}

export default Header