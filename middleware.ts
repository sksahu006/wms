import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Publicly accessible paths (no auth required)
const PUBLIC_PATHS = ['/', '/login', '/api/auth']

// Customer is only allowed these dashboard routes
const CUSTOMER_ALLOWED_PATHS = [
  '/dashboard/spaces',
  '/dashboard/invoices',
  '/dashboard/agreements',
  '/dashboard/support',
  '/dashboard/settings',
]

// Admin-only routes (not accessible to CUSTOMERS)
const ADMIN_ONLY_PATHS = [
  '/dashboard/clients',
  '/dashboard/warehouse',
  '/dashboard', // base admin dashboard
]

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log(`[Middleware] Processing request for pathname: ${pathname}`);

  // Allow public paths without auth
  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path))) {
    console.log(`[Middleware] Allowing public path: ${pathname}`);
    return NextResponse.next()
  }

  // Get user token from session
  const token = await getToken({ req })
  console.log(`[Middleware] Token retrieved: ${token ? JSON.stringify(token) : 'No token'}`);

  if (!token) {
    console.log(`[Middleware] No token found, redirecting to /login`);
    return NextResponse.redirect(new URL('/login', req.url))
  }

  const userRole = token.role
  console.log(`[Middleware] User role: ${userRole}`);

  // Explicitly block customers from accessing /dashboard exactly
  if (userRole === 'CUSTOMER' && pathname === '/dashboard') {
    console.log(`[Middleware] Customer attempted to access /dashboard, redirecting to /dashboard/spaces`);
    return NextResponse.redirect(new URL('/dashboard/spaces', req.url))
  }

  // Block customers from admin-only routes
  if (
    userRole !== 'ADMIN' &&
    ADMIN_ONLY_PATHS.some(
      (path) => pathname === path || pathname.startsWith(path + '/')
    )
  ) {
    console.log(`[Middleware] Non-admin attempted to access admin-only path: ${pathname}, redirecting to /dashboard/spaces`);
    return NextResponse.redirect(new URL('/dashboard/spaces', req.url))
  }

  // Block customers from any route except their allowed ones
  if (
    userRole === 'CUSTOMER' &&
    !CUSTOMER_ALLOWED_PATHS.some((path) => pathname === path || pathname.startsWith(path))
  ) {
    console.log(`[Middleware] Customer attempted to access restricted path: ${pathname}, redirecting to /dashboard/spaces`);
    return NextResponse.redirect(new URL('/dashboard/spaces', req.url))
  }

  console.log(`[Middleware] Allowing access to ${pathname} for role ${userRole}`);
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard/'], // Explicitly include trailing slash for /dashboard
}