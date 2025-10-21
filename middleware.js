import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"
import logger from "./lib/logger"

// Track redirect attempts to prevent infinite loops
function trackRedirectAttempt(request) {
    const url = request.nextUrl.clone()
    const redirectCount = parseInt(url.searchParams.get('_redirect_count') || '0')
    
    // If too many redirects, clear cookies and go to home
    if (redirectCount > 3) {
        const response = NextResponse.redirect(new URL('/', request.nextUrl))
        // Clear problematic cookies
        response.cookies.delete('access_token')
        response.cookies.delete('refresh_token') 
        response.cookies.delete('session_token')
        return response
    }
    
    return redirectCount
}

/**
 * Add security headers to response
 * @param {NextResponse} response - Response to add headers to
 * @returns {NextResponse} Response with security headers
 */
function addSecurityHeaders(response) {
    // Content-Security-Policy: Prevent XSS attacks
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' checkout.razorpay.com; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data: https:; " +
        "font-src 'self' data:; " +
        "connect-src 'self' checkout.razorpay.com;"
    );

    // X-Frame-Options: Prevent clickjacking
    response.headers.set('X-Frame-Options', 'DENY');

    // X-Content-Type-Options: Prevent MIME sniffing
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Referrer-Policy: Control referrer information
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permissions-Policy: Disable unnecessary browser features
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // X-XSS-Protection: Legacy XSS protection for older browsers
    response.headers.set('X-XSS-Protection', '1; mode=block');

    // Strict-Transport-Security: Force HTTPS (production only)
    if (process.env.NODE_ENV === 'production') {
        response.headers.set(
            'Strict-Transport-Security',
            'max-age=31536000; includeSubDomains; preload'
        );
    }

    return response;
}

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const hasToken = request.cookies.has('access_token')
        
        // Track redirect attempts
        const redirectCount = trackRedirectAttempt(request)
        if (redirectCount instanceof NextResponse) {
            return addSecurityHeaders(redirectCount); // Emergency redirect response with security headers
        }

        if (!hasToken) {
            // if the user is not loggedin and trying to access a protected route, redirect to login page. 
            if (!pathname.startsWith('/auth')) {
                const loginUrl = new URL(WEBSITE_LOGIN, request.nextUrl)
                loginUrl.searchParams.set('_redirect_count', (redirectCount + 1).toString())
                return addSecurityHeaders(NextResponse.redirect(loginUrl));
            }
            return addSecurityHeaders(NextResponse.next()); // Allow access to auth routes if not logged in. 
        }

        // verify token 
        const access_token = request.cookies.get('access_token').value
        
        // Check if SECRET_KEY is defined
        if (!process.env.SECRET_KEY) {
            logger.error('SECRET_KEY is not defined in environment variables');
            const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
            response.cookies.delete('access_token')
            response.cookies.delete('refresh_token')
            return addSecurityHeaders(response);
        }
        
        const { payload } = await jwtVerify(access_token, new TextEncoder().encode(process.env.SECRET_KEY))

        const role = payload.role

        // prevent logged-in users from accessing auth routes 
        if (pathname.startsWith('/auth')) {
            const dashboardUrl = new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl)
            return addSecurityHeaders(NextResponse.redirect(dashboardUrl));
        }

        // protect admin route  
        if (pathname.startsWith('/admin') && role !== 'admin') {
            const loginUrl = new URL(WEBSITE_LOGIN, request.nextUrl)
            loginUrl.searchParams.set('_redirect_count', (redirectCount + 1).toString())
            return addSecurityHeaders(NextResponse.redirect(loginUrl));
        }

        // protect user route  
        if (pathname.startsWith('/my-account') && role !== 'user') {
            const loginUrl = new URL(WEBSITE_LOGIN, request.nextUrl)
            loginUrl.searchParams.set('_redirect_count', (redirectCount + 1).toString())
            return addSecurityHeaders(NextResponse.redirect(loginUrl));
        }

        return addSecurityHeaders(NextResponse.next());

    } catch (error) {
        logger.warn({ error: error.message, path: request.nextUrl.pathname }, 'Middleware authentication error');
        
        // If JWT verification fails, clear the problematic token and redirect
        const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        response.cookies.delete('access_token')
        response.cookies.delete('refresh_token')
        
        return addSecurityHeaders(response);
    }
}


export const config = {
    matcher: ['/admin/:path*', '/my-account/:path*', '/auth/:path*']
}