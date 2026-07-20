'use client';

import { Download } from 'lucide-react';
import { getSessionId } from '@/lib/session-id';

// The category PDF is a plain link (no fetch), so the analytics session id
// can't travel as a header — it's appended as ?sid= right before navigation.
// Done on click (not render) to keep server and client HTML identical.
export function CategoryPdfLink({
  slug,
  locale,
  label,
}: {
  slug: string;
  locale: string;
  label: string;
}) {
  const baseHref = `/api/fragen/${slug}/pdf?locale=${locale}`;
  return (
    <a
      href={baseHref}
      onClick={(e) => {
        const sid = getSessionId();
        if (sid) e.currentTarget.href = `${baseHref}&sid=${encodeURIComponent(sid)}`;
      }}
      className="inline-flex min-h-[40px] items-center justify-center gap-2 rounded-ds border-[1.5px] border-[var(--border-strong)] bg-[var(--surface-card)] px-[18px] py-[9px] font-sans text-[0.9375rem] font-semibold leading-none tracking-[0.01em] text-[var(--text-strong)] no-underline transition-colors hover:bg-[var(--surface-inset)]"
    >
      <Download className="h-4 w-4" aria-hidden /> {label}
    </a>
  );
}
