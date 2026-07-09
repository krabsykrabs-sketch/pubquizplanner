'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getSessionId } from '@/lib/session-id';

export default function TrackPageview() {
  const pathname = usePathname();
  const prevPath = useRef<string | null>(null);

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
