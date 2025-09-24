'use client'
import React from 'react'
import ThemeSwitch from './ThemeSwitch'
import UserDropdown from './UserDropdown'
import { Button } from '@/components/ui/button'
import { RiMenu4Fill } from "react-icons/ri";
import { useSidebar } from '@/components/ui/sidebar';
import AdminSearch from './AdminSearch'
import AdminMobileSearch from './AdminMobileSearch'
const Topbar = () => {
    const { toggleSidebar } = useSidebar()

    return (
        <div className='fixed border h-14 w-full top-0 left-0 z-30 md:ps-72 md:pe-8 px-4 flex items-center bg-white dark:bg-card'>

            {/* Left section - Mobile title and toggle */}
            <div className='flex items-center md:hidden'>
                <h1 className='lg:text-2xl text-xl font-bold text-pink-500 mr-2'>Narumugai</h1>
                <Button onClick={toggleSidebar} type="button" size="icon" variant="ghost" className="flex-shrink-0">
                    <RiMenu4Fill className='lg:text-lg text-base' />
                </Button>
            </div>
            
            {/* Center section - Search bar and desktop toggle */}
            <div className='flex-1 flex justify-center items-center'>
                <div className='md:flex hidden items-center gap-2 max-w-md w-full'>
                    {/* Desktop sidebar toggle button */}
                    <Button onClick={toggleSidebar} type="button" size="icon" variant="ghost" className="flex-shrink-0">
                        <RiMenu4Fill className='lg:text-lg text-base' />
                    </Button>
                    
                    <div className='flex-1'>
                        <AdminSearch />
                    </div>
                </div>
            </div>

            {/* Right section - User controls */}
            <div className='flex items-center lg:gap-3 md:gap-2 gap-1'>
                <div className='md:hidden'>
                    <AdminMobileSearch />
                </div>
                <ThemeSwitch />
                <UserDropdown />
            </div>

        </div>
    )
}

export default Topbar