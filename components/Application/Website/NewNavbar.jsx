'use client'
import { USER_DASHBOARD, WEBSITE_HOME, WEBSITE_LOGIN, WEBSITE_REGISTER, WEBSITE_SHOP, WEBSITE_WISHLIST } from '@/routes/WebsiteRoute'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { IoIosSearch } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { HiMiniBars3 } from "react-icons/hi2";
import { Button } from '@/components/ui/button'
import { useSelector } from 'react-redux'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { usePathname, useRouter } from 'next/navigation'
import userIcon from '@/public/assets/images/user.png'
import Cart from './Cart'
import WishlistIcon from './WishlistIcon'
import Search from './Search'

const NewNavbar = () => {
    const auth = useSelector(store => store.authStore.auth)
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    
    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileMenuOpen(false)
        setIsSearchOpen(false)
    }, [pathname])
    
    // Close mobile menu and search when pressing Escape
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false)
                setIsSearchOpen(false)
            }
        }
        
        document.addEventListener('keydown', handleEscape)
        return () => document.removeEventListener('keydown', handleEscape)
    }, [])

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isMobileMenuOpen])

    const navLinks = [
        { href: WEBSITE_HOME, label: 'Home' },
        { href: '/about-us', label: 'About' },
        { href: WEBSITE_SHOP, label: 'Shop' },
        { href: '/categories', label: 'Categories' },
    ]

    return (
        <>
            {/* Main Navbar */}
            <nav >
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex justify-between items-center h-16'>
                        
                        {/* Logo */}
                        <Link href={WEBSITE_HOME} className='flex items-center space-x-2'>
                            <div className='text-center'>
                                <h1 className='text-2xl md:text-3xl font-bold text-pink-500 tracking-tight'>
                                    Narumugai
                                    <span className='hidden sm:inline'> Boutique</span>
                                </h1>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className='hidden lg:flex items-center space-x-8'>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-gray-700 hover:text-pink-600 font-medium transition-all duration-200 hover:scale-105 ${
                                        pathname === link.href ? 'text-pink-600 border-b-2 border-pink-600' : ''
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>

                        {/* Right Side Actions */}
                        <div className='flex items-center space-x-4'>
                            
                            {/* Search Icon */}
                            <button
                                type='button'
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className='p-2 text-gray-600 hover:text-pink-600 hover:bg-gray-100 rounded-full transition-all duration-200'
                                aria-label="Toggle search"
                            >
                                <IoIosSearch size={20} />
                            </button>

                            {/* Wishlist */}
                            <div>
                                <WishlistIcon />
                            </div>

                            {/* Cart */}
                            <Cart />

                            {/* Auth Section */}
                            {auth ? (
                                <Link 
                                    href={USER_DASHBOARD} 
                                    className='hover:opacity-80 transition-opacity p-1 rounded-full hover:bg-gray-100'
                                >
                                    <Avatar className='w-8 h-8'>
                                        <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                                    </Avatar>
                                </Link>
                            ) : (
                                <div className='hidden md:flex items-center space-x-3'>
                                    <Link href={WEBSITE_LOGIN}>
                                        <Button variant="ghost" className='text-pink-600 hover:text-pink-700 hover:bg-pink-50'>
                                            Login
                                        </Button>
                                    </Link>
                                    <Link href={WEBSITE_REGISTER}>
                                        <Button className='bg-pink-500 hover:bg-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-200'>
                                            Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            )}

                            {/* Mobile Menu Button */}
                            <button
                                type='button'
                                onClick={() => setIsMobileMenuOpen(true)}
                                className='lg:hidden p-2 text-gray-600 hover:text-pink-600 hover:bg-gray-100 rounded-full transition-all duration-200'
                                aria-label="Open mobile menu"
                            >
                                <HiMiniBars3 size={24} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <Search isShow={isSearchOpen} />
            </nav>

            {/* Mobile Menu Overlay */}
            <div className={`fixed inset-0 z-50 lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
                {/* Backdrop */}
                <div 
                    className='fixed inset-0 bg-black/50 backdrop-blur-sm'
                    onClick={() => setIsMobileMenuOpen(false)}
                />
                
                {/* Mobile Menu Panel */}
                <div className={`fixed right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    
                    {/* Header */}
                    <div className='flex items-center justify-between p-6 border-b border-gray-200'>
                        <h2 className='text-xl font-bold text-pink-500'>Menu</h2>
                        <button
                            type='button'
                            onClick={() => setIsMobileMenuOpen(false)}
                            className='p-2 text-gray-600 hover:text-pink-600 hover:bg-gray-100 rounded-full transition-all duration-200'
                            aria-label="Close mobile menu"
                        >
                            <IoMdClose size={24} />
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <div className='px-6 py-4 space-y-1'>
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`block px-4 py-3 text-lg font-medium rounded-lg transition-all duration-200 ${
                                    pathname === link.href 
                                        ? 'text-pink-600 bg-pink-50 border-l-4 border-pink-600' 
                                        : 'text-gray-700 hover:text-pink-600 hover:bg-gray-50'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Mobile Wishlist */}
                    <div className='px-6 py-2 border-t border-gray-200'>
                        <div
                            onClick={() => {
                                setIsMobileMenuOpen(false);
                                // Navigate to wishlist page
                                router.push(WEBSITE_WISHLIST);
                            }}
                            className='flex items-center px-4 py-3 text-lg font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 rounded-lg transition-all duration-200 cursor-pointer'
                        >
                            <WishlistIcon />
                            <span className='ml-3'>Wishlist</span>
                        </div>
                    </div>

                    {/* Mobile Auth Section */}
                    {!auth && (
                        <div className='absolute bottom-6 left-6 right-6 space-y-3'>
                            <Link href={WEBSITE_LOGIN} onClick={() => setIsMobileMenuOpen(false)}>
                                <Button variant="outline" className='w-full h-12 text-pink-600 border-pink-600 hover:bg-pink-50'>
                                    Login
                                </Button>
                            </Link>
                            <Link href={WEBSITE_REGISTER} onClick={() => setIsMobileMenuOpen(false)}>
                                <Button className='w-full h-12 bg-pink-500 hover:bg-pink-600 text-white shadow-lg'>
                                    Sign Up
                                </Button>
                            </Link>
                        </div>
                    )}

                    {/* Mobile User Profile */}
                    {auth && (
                        <div className='absolute bottom-6 left-6 right-6'>
                            <Link href={USER_DASHBOARD} onClick={() => setIsMobileMenuOpen(false)}>
                                <div className='flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'>
                                    <Avatar className='w-10 h-10 mr-3'>
                                        <AvatarImage src={auth?.avatar?.url || userIcon.src} />
                                    </Avatar>
                                    <div>
                                        <p className='font-medium text-gray-900'>{auth?.name || 'User'}</p>
                                        <p className='text-sm text-gray-600'>View Profile</p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default NewNavbar