import { NextResponse } from "next/server"
import { USER_DASHBOARD, WEBSITE_LOGIN } from "./routes/WebsiteRoute"
import { jwtVerify } from "jose"
import { ADMIN_DASHBOARD } from "./routes/AdminPanelRoute"

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

export async function middleware(request) {
    try {
        const pathname = request.nextUrl.pathname
        const hasToken = request.cookies.has('access_token')
        
        // Track redirect attempts
        const redirectCount = trackRedirectAttempt(request)
        if (redirectCount instanceof NextResponse) {
            return redirectCount // Emergency redirect response
        }

        if (!hasToken) {
            // if the user is not loggedin and trying to access a protected route, redirect to login page. 
            if (!pathname.startsWith('/auth')) {
                const loginUrl = new URL(WEBSITE_LOGIN, request.nextUrl)
                loginUrl.searchParams.set('_redirect_count', (redirectCount + 1).toString())
                return NextResponse.redirect(loginUrl)
            }
            return NextResponse.next() // Allow access to auth routes if not logged in. 
        }

        // verify token 
        const access_token = request.cookies.get('access_token').value
        const { payload } = await jwtVerify(access_token, new TextEncoder().encode(process.env.SECRET_KEY))

        const role = payload.role

        // prevent logged-in users from accessing auth routes 
        if (pathname.startsWith('/auth')) {
            const dashboardUrl = new URL(role === 'admin' ? ADMIN_DASHBOARD : USER_DASHBOARD, request.nextUrl)
            return NextResponse.redirect(dashboardUrl)
        }

        // protect admin route  
        if (pathname.startsWith('/admin') && role !== 'admin') {
            const loginUrl = new URL(WEBSITE_LOGIN, request.nextUrl)
            loginUrl.searchParams.set('_redirect_count', (redirectCount + 1).toString())
            return NextResponse.redirect(loginUrl)
        }

        // protect user route  
        if (pathname.startsWith('/my-account') && role !== 'user') {
            const loginUrl = new URL(WEBSITE_LOGIN, request.nextUrl)
            loginUrl.searchParams.set('_redirect_count', (redirectCount + 1).toString())
            return NextResponse.redirect(loginUrl)
        }

        return NextResponse.next()

    } catch (error) {
        console.log('Middleware error:', error)
        
        // If JWT verification fails, clear the problematic token and redirect
        const response = NextResponse.redirect(new URL(WEBSITE_LOGIN, request.nextUrl))
        response.cookies.delete('access_token')
        response.cookies.delete('refresh_token')
        
        return response
    }
}


export const config = {
    matcher: ['/admin/:path*', '/my-account/:path*', '/auth/:path*']
}