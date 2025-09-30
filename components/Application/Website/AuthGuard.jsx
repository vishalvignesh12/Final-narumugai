'use client'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const AuthGuard = ({ children, requireAuth = false }) => {
    const auth = useSelector(store => store.authStore.auth)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    // Don't render anything on server side to avoid hydration mismatch
    if (!isClient) {
        return null
    }

    // Always show content - the login modal will handle prompting for authentication
    return children
}

export default AuthGuard