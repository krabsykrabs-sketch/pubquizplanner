'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';

/** Centered modal dialog with blurred scrim. Render conditionally on `open`. */
export default function Dialog({
  open,
  onClose,
  width = 460,
  className = '',
  children,
}: {
  open: boolean;
  onClose: () => void;
  width?: number;
  className?: string;
  children: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[1000] flex items-center justify-center p-6"
      style={{
        background: 'rgba(22, 17, 13, 0.55)',
        backdropFilter: 'blur(3px)',
        animation: 'pqp-fade var(--dur) var(--ease-out)',
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={`w-full overflow-hidden rounded-ds-xl border border-[var(--border-subtle)] bg-[var(--surface-card)] shadow-warm-xl ${className}`}
        style={{ maxWidth: width, animation: 'pqp-pop var(--dur-slow) var(--ease-out)' }}
      >
        {children}
      </div>
    </div>
  );
}
