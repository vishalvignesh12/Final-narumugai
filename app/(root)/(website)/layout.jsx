import Footer from '@/components/Application/Website/Footer'
import NewNavbar from '@/components/Application/Website/NewNavbar'
import LoginModal from '@/components/Application/Website/LoginModal'
import AuthGuard from '@/components/Application/Website/AuthGuard'
import React from 'react'
import { Kumbh_Sans } from 'next/font/google'

const kumbh = Kumbh_Sans({
    weight: ['400', '500', '600', '700', '800'],
    display: 'swap',
    subsets: ['latin']
})

const layout = ({ children }) => {
    return (
        <div className={kumbh.className}>
            <AuthGuard requireAuth={false}>
                <NewNavbar />
                <main>
                    {children}
                </main>
                <Footer />
            </AuthGuard>
            <LoginModal />
        </div>
    )
}

export default layout