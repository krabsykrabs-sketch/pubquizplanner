import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { verifyToken, getTokenFromCookies } from './lib/admin-auth';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // --- Admin routes: skip next-intl entirely ---

  // Admin login page: no auth needed, just pass through
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Admin pages: require auth cookie
  if (pathname.startsWith('/admin')) {
    const token = getTokenFromCookies(request.cookies);
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin API login endpoint: no auth needed
  if (pathname === '/api/admin/login') {
    return NextResponse.next();
  }

  // Admin API routes: require auth cookie
  if (pathname.startsWith('/api/admin')) {
    const token = getTokenFromCookies(request.cookies);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // --- All other routes: next-intl locale routing ---
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(de|en)/:path*', '/admin/:path*', '/api/admin/:path*'],
};
