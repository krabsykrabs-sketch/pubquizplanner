'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getSessionId } from '@/lib/session-id';

// Visitor country, resolved once per session from geojs.io (which reads the
// request IP at its edge and returns only a country code). We never see or
// store the IP; only the two-letter code is cached in sessionStorage and sent
// with the pageview. Sentinel '-' marks "resolved, unknown" so we don't retry.
async function resolveCountry(): Promise<void> {
  try {
    if (sessionStorage.getItem('pqp_country')) return;
    const res = await fetch('https://get.geojs.io/v1/ip/country.json');
    const data = await res.json();
    const code =
      typeof data?.country === 'string' && /^[A-Za-z]{2}$/.test(data.country)
        ? data.country.toUpperCase()
        : '-';
    sessionStorage.setItem('pqp_country', code);
  } catch {
    try {
      sessionStorage.setItem('pqp_country', '-');
    } catch {
      // sessionStorage unavailable — country stays server-side (Accept-Language)
    }
  }
}

function cachedCountry(): string | null {
  try {
    const c = sessionStorage.getItem('pqp_country');
    return c && c !== '-' ? c : null;
  } catch {
    return null;
  }
}

export default function TrackPageview() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

  // Kick off country resolution on mount so it's cached before later pageviews.
  // The beacon itself never waits on it — the first pageview may go out without
  // a precise country and the server falls back to the Accept-Language region.
  useEffect(() => {
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(window.location.hostname)) return;
    if (document.cookie.split('; ').includes('pqp_notrack=1')) return;
    resolveCountry();
  }, []);

  useEffect(() => {
    if (!pathname || pathname === prevPath.current) return;

    // Never track from dev environments or from the admin's own browser
    // (opt-out cookie set on admin login). Saves the request entirely.
    if (
      /^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(window.location.hostname) ||
      document.cookie.split('; ').includes('pqp_notrack=1')
    ) {
      prevPath.current = pathname;
      return;
    }

    const payload = JSON.stringify({
      path: pathname,
      // First view of the session carries the external referrer; internal
      // navigations carry the previous path (starts with '/').
      referrer: prevPath.current ?? document.referrer ?? null,
      sessionId: getSessionId(),
      country: cachedCountry(),
    });
    prevPath.current = pathname;

    try {
      if (!navigator.sendBeacon?.('/api/track', new Blob([payload], { type: 'application/json' }))) {
        fetch('/api/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // tracking must never break the page
    }
  }, [pathname]);

  return null;
}
