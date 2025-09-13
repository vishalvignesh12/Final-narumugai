import AppSidebar from '@/components/Application/Admin/AppSidebar'
import ThemeProvider from '@/components/Application/Admin/ThemeProvider'
import Topbar from '@/components/Application/Admin/Topbar'
import { SidebarProvider } from '@/components/ui/sidebar'
import React from 'react'

const layout = ({ children }) => {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
        >
            <SidebarProvider>
                <AppSidebar />
                <main className="md:w-[calc(100vw-16rem)] w-full overflow-x-hidden">
                    <div className='pt-[70px] lg:px-8 md:px-6 px-4 min-h-[calc(100vh-40px)] lg:pb-10 md:pb-8 pb-6'>
                        <Topbar />
                        {children}
                    </div>

                    <div className='border-t h-[40px] flex justify-center items-center bg-gray-50 dark:bg-background lg:text-sm text-xs px-4'>
                        © {new Date().getFullYear()} Narumugai™. All Rights Reserved.
                    </div>
                </main>
            </SidebarProvider>
        </ThemeProvider>
    )
}

export default layout