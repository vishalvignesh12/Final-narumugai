/**
 * Automatic Cookie Management Utility for preventing redirect loops
 * Runs completely in the background without user intervention
 */

export class CookieManager {
    static isInitialized = false
    static monitoringInterval = null
    static redirectCheckInterval = null

    /**
     * Get all cookies from the browser
     */
    static getAllCookies() {
        if (typeof document === 'undefined') return {}
        
        const cookies = {}
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=')
            if (name) {
                cookies[name] = value || ''
            }
        })
        return cookies
    }

    /**
     * Delete a specific cookie
     */
    static deleteCookie(name, path = '/', domain = '') {
        if (typeof document === 'undefined') return false
        
        try {
            let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
            if (domain) {
                cookieString += ` domain=${domain};`
            }
            document.cookie = cookieString
            return true
        } catch (error) {
            console.error(`Failed to delete cookie ${name}:`, error)
            return false
        }
    }

    /**
     * Delete all cookies for the current domain
     */
    static deleteAllCookies() {
        if (typeof document === 'undefined') return false
        
        try {
            const cookies = this.getAllCookies()
            const domains = ['', 'localhost', '127.0.0.1', window.location.hostname]
            const paths = ['/', '/admin', '/auth', '/my-account']
            
            Object.keys(cookies).forEach(cookieName => {
                // Try different domain and path combinations
                domains.forEach(domain => {
                    paths.forEach(path => {
                        this.deleteCookie(cookieName, path, domain)
                    })
                })
            })
            
            return true
        } catch (error) {
            console.error('Failed to delete all cookies:', error)
            return false
        }
    }

    /**
     * Delete specific authentication-related cookies
     */
    static deleteAuthCookies() {
        if (typeof document === 'undefined') return false
        
        const authCookies = [
            'access_token',
            'refresh_token',
            'auth_token',
            'session_token',
            'user_token',
            'admin_token',
            'jwt_token',
            '__session',
            'next-auth.session-token',
            'next-auth.csrf-token'
        ]
        
        try {
            authCookies.forEach(cookieName => {
                this.deleteCookie(cookieName)
                this.deleteCookie(cookieName, '/admin')
                this.deleteCookie(cookieName, '/auth')
                this.deleteCookie(cookieName, '/my-account')
            })
            return true
        } catch (error) {
            console.error('Failed to delete auth cookies:', error)
            return false
        }
    }

    /**
     * Check if we're in a redirect loop
     */
    static isRedirectLoop() {
        if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return false
        
        try {
            const redirectCount = sessionStorage.getItem('redirect_count') || 0
            const lastRedirect = sessionStorage.getItem('last_redirect_time') || 0
            const currentTime = Date.now()
            
            // Reset count if more than 10 seconds have passed
            if (currentTime - lastRedirect > 10000) {
                sessionStorage.setItem('redirect_count', '0')
                return false
            }
            
            return parseInt(redirectCount) > 2 // Reduced threshold for faster response
        } catch (error) {
            console.error('Failed to check redirect loop:', error)
            return false
        }
    }

    /**
     * Track redirect attempts
     */
    static trackRedirect() {
        if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return
        
        try {
            const currentCount = parseInt(sessionStorage.getItem('redirect_count') || '0')
            sessionStorage.setItem('redirect_count', (currentCount + 1).toString())
            sessionStorage.setItem('last_redirect_time', Date.now().toString())
        } catch (error) {
            console.error('Failed to track redirect:', error)
        }
    }

    /**
     * Reset redirect tracking
     */
    static resetRedirectTracking() {
        if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return
        
        try {
            sessionStorage.removeItem('redirect_count')
            sessionStorage.removeItem('last_redirect_time')
        } catch (error) {
            console.error('Failed to reset redirect tracking:', error)
        }
    }

    /**
     * Automatic cleanup - removes problematic cookies silently
     */
    static autoCleanup() {
        if (typeof window === 'undefined' || typeof localStorage === 'undefined' || typeof sessionStorage === 'undefined') return false
        
        try {
            // Clear auth cookies first
            this.deleteAuthCookies()
            
            // Clear localStorage items that might cause issues
            const problematicKeys = [
                'auth_state',
                'user_session',
                'admin_session',
                'login_redirect',
                'auth_redirect'
            ]
            
            problematicKeys.forEach(key => {
                if (typeof localStorage !== 'undefined') {
                    localStorage.removeItem(key)
                }
            })
            
            // Clear any cached auth data
            if ('caches' in window) {
                caches.keys().then(names => {
                    names.forEach(name => {
                        if (name.includes('auth') || name.includes('session')) {
                            caches.delete(name)
                        }
                    })
                })
            }
            
            this.resetRedirectTracking()
            console.log('🧹 Automatic cookie cleanup completed')
            return true
        } catch (error) {
            console.error('Auto cleanup failed:', error)
            return false
        }
    }

    /**
     * Check for problematic cookies that might cause issues
     */
    static hasProblematicCookies() {
        if (typeof window === 'undefined') return false
        
        try {
            const cookies = this.getAllCookies()
            
            // Check for expired or malformed tokens
            for (const [name, value] of Object.entries(cookies)) {
                if (name.includes('token') || name.includes('auth')) {
                    // Check if token looks malformed (too short, contains invalid chars, etc.)
                    if (value && value.length < 10) {
                        return true
                    }
                    
                    // Check for obviously invalid tokens
                    if (value && (value === 'undefined' || value === 'null' || value === '')) {
                        return true
                    }
                }
            }
            
            return false
        } catch (error) {
            return true // If we can't check, assume there might be issues
        }
    }

    /**
     * Monitor page load and URL changes for redirect patterns
     */
    static monitorPageChanges() {
        if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined') return
        
        let lastUrl = window.location.href
        let urlChangeCount = 0
        let lastUrlChangeTime = Date.now()
        
        const checkUrlChanges = () => {
            const currentUrl = window.location.href
            const currentTime = Date.now()
            
            if (currentUrl !== lastUrl) {
                urlChangeCount++
                
                // If URL changed more than 3 times in 5 seconds, likely a redirect loop
                if (urlChangeCount > 3 && (currentTime - lastUrlChangeTime) < 5000) {
                    console.warn('🔄 Rapid URL changes detected, performing auto cleanup')
                    this.autoCleanup()
                    setTimeout(() => {
                        window.location.href = '/'
                    }, 1000)
                }
                
                // Reset counter if enough time has passed
                if (currentTime - lastUrlChangeTime > 10000) {
                    urlChangeCount = 0
                }
                
                lastUrl = currentUrl
                lastUrlChangeTime = currentTime
            }
        }
        
        // Check every 500ms for URL changes
        setInterval(checkUrlChanges, 500)
    }

    /**
     * Initialize automatic monitoring system
     */
    static initializeAutoMonitoring() {
        if (typeof window === 'undefined' || typeof sessionStorage === 'undefined' || typeof localStorage === 'undefined' || this.isInitialized) return
        
        console.log('🤖 Initializing automatic cookie management...')
        this.isInitialized = true
        
        // Check for issues every 2 seconds
        this.monitoringInterval = setInterval(() => {
            // Check for redirect loops
            if (this.isRedirectLoop()) {
                console.warn('🚨 Redirect loop detected - auto cleaning cookies')
                this.autoCleanup()
                setTimeout(() => {
                    window.location.href = '/'
                }, 500)
                return
            }
            
            // Check for problematic cookies
            if (this.hasProblematicCookies()) {
                console.warn('⚠️ Problematic cookies detected - auto cleaning')
                this.autoCleanup()
            }
        }, 2000)
        
        // Monitor page changes for redirect patterns
        this.monitorPageChanges()
        
        // Clean up on page visibility change (when tab becomes active)
        if (typeof document !== 'undefined') {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden) {
                    // Clean up when user returns to tab
                    if (this.hasProblematicCookies()) {
                        this.autoCleanup()
                    }
                }
            })
        }
        
        // Clean up on page unload (when navigating away)
        if (typeof window !== 'undefined') {
            window.addEventListener('beforeunload', () => {
                if (this.hasProblematicCookies()) {
                    this.autoCleanup()
                }
            })
        }
        
        // Initial cleanup check
        setTimeout(() => {
            if (this.hasProblematicCookies()) {
                console.log('🧹 Initial cleanup - removing problematic cookies')
                this.autoCleanup()
            }
        }, 1000)
    }

    /**
     * Stop monitoring (cleanup)
     */
    static stopMonitoring() {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval)
            this.monitoringInterval = null
        }
        if (this.redirectCheckInterval) {
            clearInterval(this.redirectCheckInterval)
            this.redirectCheckInterval = null
        }
        this.isInitialized = false
    }
}

// Auto-initialize monitoring when the module loads
if (typeof window !== 'undefined') {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            CookieManager.initializeAutoMonitoring()
        })
    } else {
        // DOM is already ready
        setTimeout(() => {
            CookieManager.initializeAutoMonitoring()
        }, 100)
    }
}

export default CookieManager