import type { NextRequest } from 'next/server';
import { getTokenFromCookies, verifyToken, NOTRACK_COOKIE } from './admin-auth';

// Crawlers announce themselves with these words. The second line catches
// HTTP libraries and headless browsers that don't (Lightpanda, RootEvidence
// were counted as humans on krabsy.com, Nov 2026). Scrapers that fake a full
// browser UA still get through — downloads are additionally gated on a
// visit id in the analytics (see api/admin/analytics).
export const BOT_UA_RE = new RegExp(
  [
    'bot|crawl|spider|slurp|preview|scrape|fetch|monitor|headless',
    'lightpanda|rootevidence|phantomjs|lighthouse|scrapy|python|curl|wget|go-http|java/|okhttp|axios|httpx|libwww|aiohttp',
  ].join('|'),
  'i'
);

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
