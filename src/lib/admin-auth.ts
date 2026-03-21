import { NextResponse } from 'next/server';

const COOKIE_NAME = 'admin_token';
const MAX_AGE = 60 * 60 * 24; // 24 hours

export function generateToken(password: string): string {
  // Simple hash: we XOR-fold a basic hash of the password into a hex string.
  // For edge runtime compatibility we avoid Node crypto and use Web Crypto approach.
  // Since we just need a deterministic token from the password, we use a simple
  // string-based approach that's sufficient for a single-user admin panel.
  let hash = 0x811c9dc5; // FNV offset basis
  for (let i = 0; i < password.length; i++) {
    hash ^= password.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193); // FNV prime
  }
  // Mix in a second pass with different seed for more entropy
  let hash2 = 0x6c62272e;
  for (let i = password.length - 1; i >= 0; i--) {
    hash2 ^= password.charCodeAt(i);
    hash2 = Math.imul(hash2, 0x5f356495);
  }
  return `pqp_${(hash >>> 0).toString(16)}${(hash2 >>> 0).toString(16)}`;
}

export function verifyToken(token: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password || !token) return false;

  const expected = generateToken(password);
  if (expected.length !== token.length) return false;

  // Constant-time comparison
  let mismatch = 0;
  for (let i = 0; i < expected.length; i++) {
    mismatch |= expected.charCodeAt(i) ^ token.charCodeAt(i);
  }
  return mismatch === 0;
}

export function setAdminCookie(response: NextResponse): NextResponse {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return response;

  response.cookies.set(COOKIE_NAME, generateToken(password), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: MAX_AGE,
  });
  return response;
}

export function clearAdminCookie(response: NextResponse): NextResponse {
  response.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

export function getTokenFromCookies(cookies: { get: (name: string) => { value: string } | undefined }): string | null {
  return cookies.get(COOKIE_NAME)?.value ?? null;
}
