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
  // Next.js requires `matcher` to be a static literal, so it can't be derived
  // from the locale config. Instead of enumerating locale prefixes, we match all
  // public paths (excluding Next internals, files with an extension, and the
  // separately-handled admin/api routes) — so adding a locale needs no edit here.
  matcher: [
    '/',
    '/((?!api|_next|_vercel|admin|.*\\..*).*)',
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
