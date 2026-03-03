import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/onboarding'];

// Routes accessible only to unauthenticated users
const AUTH_ROUTES = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!token;

  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthRoute = AUTH_ROUTES.some((route) => pathname.startsWith(route));

  // Unauthenticated user trying to access a protected route → redirect to /auth
  if (isProtected && !isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/auth';
    return NextResponse.redirect(url);
  }

  // Authenticated user trying to access the auth page → redirect to dashboard
  if (isAuthRoute && isAuthenticated) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  // Run middleware only on matched routes (skip static files, api routes, etc.)
  matcher: ['/dashboard/:path*', '/onboarding/:path*', '/auth'],
};
