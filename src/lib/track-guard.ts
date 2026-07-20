import type { NextRequest } from 'next/server';
import { getTokenFromCookies, verifyToken, NOTRACK_COOKIE } from './admin-auth';

export const BOT_UA_RE = /bot|crawl|spider|slurp|preview|scrape|fetch|monitor|headless/i;

/**
 * True when an analytics event from this request should be recorded:
 * not a known crawler, not the admin's own browser (opt-out cookie set on
 * login, or a live admin session). Shared by the pageview beacon and every
 * download endpoint so crawler hits on public GET links (e.g. the category
 * PDF) don't inflate the download numbers.
 */
export function shouldTrackRequest(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || '';
  if (BOT_UA_RE.test(ua)) return false;
  if (request.cookies.get(NOTRACK_COOKIE)?.value === '1') return false;
  const adminToken = getTokenFromCookies(request.cookies);
  if (adminToken && verifyToken(adminToken)) return false;
  return true;
}
