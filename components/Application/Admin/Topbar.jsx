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
        <div className='fixed border h-14 w-full top-0 left-0 z-30 md:ps-72 md:pe-8 px-4 flex justify-between items-center bg-white dark:bg-card'>

            <div className='flex items-center md:hidden'>
                <h1 className='lg:text-2xl text-xl font-bold text-pink-500'>Narumugai</h1>
            </div>
            <div className='md:block hidden flex-1 max-w-md'>
                <AdminSearch />
            </div>


            <div className='flex items-center lg:gap-3 md:gap-2 gap-1'>
                <div className='md:hidden'>
                    <AdminMobileSearch />
                </div>
                <ThemeSwitch />
                <UserDropdown />
                <Button onClick={toggleSidebar} type="button" size="icon" className="md:hidden flex-shrink-0">
                    <RiMenu4Fill className='lg:text-lg text-base' />
                </Button>
            </div>

        </div>
    )
}

export default Topbar