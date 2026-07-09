import { NextRequest, NextResponse } from 'next/server';
import { setAdminCookie, setNoTrackCookie } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
  }

  // Admin's own browser: auth for 24h, analytics opt-out for a year.
  const response = NextResponse.json({ success: true });
  return setNoTrackCookie(setAdminCookie(response));
}
