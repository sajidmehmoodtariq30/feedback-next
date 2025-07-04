import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

// Define protected routes
const protectedRoutes = [
    '/dashboard',
    '/messages',
    '/settings',
    '/send-message',
];

// Define auth routes (should redirect to dashboard if already logged in)
const authRoutes = [
    '/sign-in',
    '/sign-up',
    '/verify',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    // Check if the current path is protected
    const isProtectedRoute = protectedRoutes.some(route => 
        pathname.startsWith(route)
    );

    // Check if the current path is an auth route
    const isAuthRoute = authRoutes.some(route => 
        pathname.startsWith(route)
    );

    // API routes starting with /api/ are handled separately
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // If user is on a protected route without a valid token
    if (isProtectedRoute) {
        if (!token) {
            return NextResponse.redirect(new URL('/sign-in', request.url));
        }

        const payload = verifyToken(token);
        if (!payload) {
            // Invalid token, clear it and redirect
            const response = NextResponse.redirect(new URL('/sign-in', request.url));
            response.cookies.delete('token');
            return response;
        }

        // Check if user is verified for certain protected routes
        if (!payload.isVerified && pathname !== '/verify') {
            return NextResponse.redirect(new URL('/verify', request.url));
        }
    }

    // If user is on an auth route with a valid token, redirect to dashboard
    if (isAuthRoute && token) {
        const payload = verifyToken(token);
        if (payload) {
            if (!payload.isVerified && pathname !== '/verify') {
                return NextResponse.redirect(new URL('/verify', request.url));
            } else if (payload.isVerified) {
                return NextResponse.redirect(new URL('/dashboard', request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public|.*\\..*$).*)',
    ],
};
