/**
 * Environment-aware configuration utility
 * Handles different environments: development, production, and multi-device access
 */

/**
 * Get the base URL for the application
 * Handles localhost, network IP, and production domains
 */
export function getBaseURL() {
    // Production environment
    if (process.env.NODE_ENV === 'production') {
        return process.env.NEXT_PUBLIC_BASE_URL || 'https://narumugai.com'
    }
    
    // Development environment
    if (process.env.NEXT_PUBLIC_BASE_URL) {
        return process.env.NEXT_PUBLIC_BASE_URL
    }
    
    // Fallback for development
    return 'http://localhost:3000'
}

/**
 * Get the current domain/host for metadata
 * Works with localhost, network IP, and production domains
 */
export function getMetadataBaseURL() {
    try {
        return new URL(getBaseURL())
    } catch (error) {
        console.warn('Invalid base URL, falling back to localhost:', error)
        return new URL('http://localhost:3000')
    }
}

/**
 * Get the current environment
 */
export function getEnvironment() {
    return process.env.NODE_ENV || 'development'
}

/**
 * Check if running in development mode
 */
export function isDevelopment() {
    return getEnvironment() === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction() {
    return getEnvironment() === 'production'
}

/**
 * Get API base URL
 */
export function getAPIBaseURL() {
    return `${getBaseURL()}/api`
}