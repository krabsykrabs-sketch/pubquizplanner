'use client';

import { Clapperboard, Play, X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Badge from '@/components/ds/Badge';
import Button from '@/components/ds/Button';
import Dialog from '@/components/ds/Dialog';
import IconButton from '@/components/ds/IconButton';

/* The demo section: a styled 16:9 question-slide preview (the design system's
 * quiz-card treatment) that opens the REAL generated demo deck (served by
 * /api/demo) in a dialog iframe — fully playable, exactly like a downloaded
 * deck. When no demo deck exists yet, a graceful empty state renders instead. */

function SlidePreviewCard({ onOpen, label }: { onOpen: () => void; label: string }) {
  const t = useTranslations('landing');
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen();
      }}
      className="group relative mx-auto mt-10 max-w-[880px] cursor-pointer overflow-hidden rounded-ds-xl border border-[var(--border-subtle)] shadow-warm-lg transition-shadow hover:shadow-warm-xl focus-visible:outline-none focus-visible:[box-shadow:var(--ring)]"
    >
      <div data-theme="dark" className="relative aspect-video overflow-hidden bg-[var(--night-800)]">
        <Image
          src="/categories/kunst-kultur/projector.png"
          alt=""
          fill
          sizes="880px"
          className="object-cover object-right"
        />
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(22,17,13,0.92) 42%, rgba(22,17,13,0.30) 72%, rgba(22,17,13,0) 100%)',
          }}
        />
        {/* quiz-card: a clean QUESTION slide (no answer — answers come later, as their own round) */}
        <div
          className="absolute left-[5.5%] top-1/2 w-[55%] rounded-[22px] bg-[var(--warm-50)] px-[6%] pb-[6%] pt-[6.5%]"
          style={{
            transform: 'translateY(-50%) rotate(-1.1deg)',
            boxShadow: '0 22px 50px rgba(0,0,0,0.45)',
          }}
        >
          <div className="mb-[5.5%] flex items-center gap-[11px]">
            <span
              className="flex items-center justify-center rounded-[14px] bg-[var(--amber-500)] font-mono font-semibold text-white"
              style={{
                width: 'clamp(40px, 4.6vw, 60px)',
                height: 'clamp(40px, 4.6vw, 60px)',
                fontSize: 'clamp(0.9rem, 2vw, 1.35rem)',
                boxShadow: '0 4px 0 var(--amber-700)',
              }}
            >
              07
            </span>
            <span
              className="rounded-full bg-[#F7E4D2] px-[13px] py-[7px] font-mono uppercase tracking-[0.14em] text-[var(--amber-700)]"
              style={{ fontSize: 'clamp(0.58rem, 1.05vw, 0.82rem)' }}
            >
              {t('demoSampleCategory')}
            </span>
            <span
              className="ml-auto font-mono text-[var(--warm-500)]"
              style={{ fontSize: 'clamp(0.56rem, 0.95vw, 0.78rem)' }}
            >
              {t('demoProgress', { n: 7, total: 20 })}
            </span>
          </div>
          <h3
            className="m-0 font-display font-extrabold leading-[1.1] tracking-[-0.02em] text-[var(--warm-900)] [text-wrap:balance]"
            style={{ fontSize: 'clamp(1.1rem, 2.6vw, 2rem)' }}
          >
            {t('demoSampleQuestion')}
          </h3>
          <div
            className="mt-[5.5%] inline-flex items-center gap-2 rounded-full border-[1.5px] border-[var(--warm-200)] bg-[var(--warm-100)] px-3.5 py-2 font-mono text-[var(--warm-700)]"
            style={{ fontSize: 'clamp(0.58rem, 1vw, 0.82rem)' }}
          >
            <b className="text-[var(--amber-700)]">{t('demoPoints', { points: 10 })}</b>
          </div>
        </div>
        <div className="absolute right-[5%] top-[8%] inline-flex h-[54px] w-[54px] items-center justify-center rounded-full bg-[var(--accent)] text-[var(--text-on-accent)] shadow-warm-xl transition-transform group-hover:scale-105">
          <Play className="h-6 w-6 fill-current" aria-hidden />
        </div>
      </div>
    </div>
  );
}

export default function DemoQuiz({
  locale,
  demoReady,
}: {
  locale: string;
  demoReady: boolean;
}) {
  const t = useTranslations('landing');
  const tDemo = useTranslations('demo');
  const [open, setOpen] = useState(false);

  return (
    <section className="bg-[var(--bg-page)] py-[60px] nav:py-[92px]">
      <div className="mx-auto max-w-container px-6 text-center">
        <div className="mb-4 inline-flex">
          <Badge tone="accent">{t('demoBadge')}</Badge>
        </div>
        <h2 className="mx-auto max-w-[20ch] font-display text-4xl font-extrabold tracking-[-0.02em] text-[var(--text-strong)]">
          {t('demoTitle')}
        </h2>
        <p className="mx-auto mt-3.5 max-w-[52ch] text-[1.0625rem] leading-[1.6] text-[var(--text-muted)]">
          {t('demoText')}
        </p>

        {demoReady ? (
          <>
            <SlidePreviewCard onOpen={() => setOpen(true)} label={t('demoPlay')} />
            <div className="mt-[22px]">
              <Button
                variant="secondary"
                onClick={() => setOpen(true)}
                iconLeft={<Play className="h-4 w-4" aria-hidden />}
              >
                {t('demoPlay')}
              </Button>
            </div>
          </>
        ) : (
          <div className="mx-auto mt-10 max-w-[640px] rounded-ds-xl border-[1.5px] border-dashed border-[var(--border-strong)] bg-[var(--bg-sunken)] px-8 py-11 text-center">
            <div className="mb-3.5 inline-flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--surface-inset)] text-[var(--text-muted)]">
              <Clapperboard aria-hidden />
            </div>
            <h3 className="m-0 mb-1.5 font-display text-[1.3rem] font-bold text-[var(--text-strong)]">
              {t('demoEmptyTitle')}
            </h3>
            <p className="m-0 text-[0.95rem] text-[var(--text-muted)]">{t('demoEmptyText')}</p>
          </div>
        )}
      </div>

      <Dialog open={open} onClose={() => setOpen(false)} width={1100} className="bg-black">
        <div className="relative aspect-video w-full">
          <IconButton
            label={tDemo('close')}
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
            className="absolute right-2 top-2 z-10 border-transparent bg-black/60 text-white hover:bg-black/80"
          >
            <X className="h-[18px] w-[18px]" aria-hidden />
          </IconButton>
          <iframe
            src={`/api/demo?locale=${locale}`}
            title={tDemo('deckTitle')}
            className="h-full w-full border-0"
          />
        </div>
      </Dialog>
    </section>
  );
}
