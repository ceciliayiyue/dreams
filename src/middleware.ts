import { NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from 'better-auth/cookies';

export function middleware(request: NextRequest) {
    // Use better-auth's getSessionCookie function to check for session cookie
    const sessionCookie = getSessionCookie(request, {
        cookieName: "session_token",
        cookiePrefix: "better-auth"
    });

    // If we can't check the session cookie directly, check if cookie exists manually
    if (!sessionCookie && request.cookies.has('better-auth.session_token')) {
        const manualCookie = request.cookies.get('better-auth.session_token');
        if (manualCookie && manualCookie.value) {
            // Cookie exists but getSessionCookie failed to retrieve it
            console.log("Found cookie manually:", manualCookie.name);
            // Proceed as if authenticated
            return NextResponse.next();
        }
    }

    // Get the current path
    const { pathname } = request.nextUrl;

    // Define protected routes
    const protectedRoutes = ['/dashboard', '/interpret'];

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname.startsWith(route)
    );

    // If accessing a protected route and no session cookie found, redirect to login
    if (isProtectedRoute && !sessionCookie) {
        // Create URL for the login page
        const url = request.nextUrl.clone();
        url.pathname = "/login";

        // Set the redirect path as a query parameter
        url.searchParams.set("redirect", pathname);

        // Redirect to the login page
        return NextResponse.redirect(url);
    }

    // If already logged in and trying to access login page
    if (pathname === '/login' && sessionCookie) {
        // Get the redirect URL from query params or default to dashboard
        const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard';
        const url = request.nextUrl.clone();
        url.pathname = redirectUrl;
        return NextResponse.redirect(url);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        // Add all protected routes
        '/dashboard/:path*',
        '/interpret/:path*',
        '/login',
        // Add any routes in the (auth) folder
        '/(auth)/:path*'
    ],
};