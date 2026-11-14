'use client';

import { getSessionId } from '@/lib/session-id';
import type { GeneratorAction } from '@/lib/generator-events';

// Fire-and-forget generator funnel event (see generator-events.ts). Same
// opt-outs as the pageview beacon: never from dev hosts or the admin's own
// browser. Uses sendBeacon where available so 'exit' survives page unload.
export function trackGenerator(action: GeneratorAction, meta?: Record<string, unknown>): void {
  try {
    if (/^(localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\])$/.test(window.location.hostname)) return;
    if (document.cookie.split('; ').includes('pqp_notrack=1')) return;
    const sessionId = getSessionId();
    if (!sessionId) return;
    const body = JSON.stringify({ action, meta: meta ?? {}, sessionId });
    if (navigator.sendBeacon?.('/api/generator-event', new Blob([body], { type: 'application/json' }))) {
      return;
    }
    fetch('/api/generator-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  } catch {
    // analytics must never break the generator
  }
}
