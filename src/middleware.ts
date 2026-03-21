import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { verifyToken, getTokenFromCookies } from './lib/admin-auth';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin page routes (not login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = getTokenFromCookies(request.cookies);
    if (!token || !verifyToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // Admin API routes (not login endpoint)
  if (pathname.startsWith('/api/admin') && !pathname.startsWith('/api/admin/login')) {
    const token = getTokenFromCookies(request.cookies);
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // All other routes: next-intl
  return intlMiddleware(request);
}

export const config = {
  matcher: ['/', '/(de|en)/:path*', '/admin/:path*', '/api/admin/:path*'],
};
