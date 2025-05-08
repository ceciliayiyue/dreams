import { type NextRequest, NextResponse } from "next/server"
import { getSessionCookie } from "better-auth/cookies"

export async function middleware(request: NextRequest) {
    // Use getSessionCookie helper for more efficient auth check in middleware
    const sessionCookie = getSessionCookie(request)
    const { pathname } = request.nextUrl

    // Protect dashboard and todos routes - redirect to login if not authenticated
    if ((pathname === "/dashboard" || pathname.startsWith("/dashboard/") ||
        pathname.startsWith("/interpret")) && !sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url))
    }



    // Redirect logged-in users away from login page to dashboard
    if ((pathname === "/login" || pathname === "/") && sessionCookie) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    // Redirect root to login when not logged in
    if (pathname === "/" && !sessionCookie) {
        return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/", "/login", "/dashboard/:path*"]
}