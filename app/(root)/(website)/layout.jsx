import Footer from '@/components/Application/Website/Footer'
import NewNavbar from '@/components/Application/Website/NewNavbar'
import LoginModal from '@/components/Application/Website/LoginModal'
import AuthGuard from '@/components/Application/Website/AuthGuard'
import React from 'react'

const layout = ({ children }) => {
    return (
        <div className="font-sans">
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
