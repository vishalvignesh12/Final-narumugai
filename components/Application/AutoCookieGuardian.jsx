'use client'
import { useEffect } from 'react'
import CookieManager from '@/lib/cookieManager'
import { shouldClearSessionForStatus } from '@/lib/authStatus'

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
                if (shouldClearSessionForStatus(response.status)) {
                    CookieManager.deleteAuthCookies()
                    window.dispatchEvent(new Event('auth-expired'))
                }
                return response
            } catch (error) {
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
