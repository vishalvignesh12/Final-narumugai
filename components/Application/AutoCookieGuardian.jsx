'use client'
import { useEffect } from 'react'
import CookieManager from '@/lib/cookieManager'

const AutoCookieGuardian = () => {
    useEffect(() => {
        CookieManager.initializeAutoMonitoring()
        
        const handleAuthError = (event) => {
            if (event.detail?.type === 'auth_error') {
                CookieManager.autoCleanup()
            }
        }
        
        window.addEventListener('auth_error', handleAuthError)
        
        const originalFetch = window.fetch
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args)
                if (response.status === 401 || response.status === 403) {
                    CookieManager.deleteAuthCookies()
                }
                return response
            } catch (error) {
                if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                    CookieManager.autoCleanup()
                }
                throw error
            }
        }
        
        return () => {
            window.removeEventListener('auth_error', handleAuthError)
            window.fetch = originalFetch
        }
    }, [])
    
    return null
}

export default AutoCookieGuardian