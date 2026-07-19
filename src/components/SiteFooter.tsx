import { getTranslations } from 'next-intl/server';
import { QuestionRoundel } from '@/components/ds/Wordmark';
import { LOCALE_LABELS, LOCALES, type Locale } from '@/config/locales';
import { questionsIndexPath } from '@/config/slugs';

export default async function SiteFooter({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: 'footer' });

  const links = [
    { href: questionsIndexPath(locale), label: t('questions') },
    { href: `/${locale}/impressum`, label: t('impressum') },
    { href: `/${locale}/datenschutz`, label: t('privacy') },
    { href: `/${locale}/credits`, label: 'Credits' },
  ];

  return (
    <footer data-theme="dark" className="bg-[var(--night-900)] text-[var(--text-faint)]">
      <div className="mx-auto flex max-w-container flex-wrap items-start justify-between gap-8 px-6 py-12">
        <div className="max-w-[30ch]">
          <span className="mb-2.5 inline-flex items-center gap-2.5 font-display text-[1.15rem] font-extrabold tracking-[-0.03em] text-white">
            <QuestionRoundel size={27} className="text-[var(--amber-400)]" />
            PubQuizPlanner
          </span>
          <p className="m-0 text-[0.85rem] leading-normal">{t('description')}</p>
        </div>
        <nav className="flex flex-wrap gap-[26px]">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-[0.9rem] text-[var(--text-muted)] no-underline transition-colors hover:text-[var(--text-body)]"
            >
              {l.label}
            </a>
          ))}
        </nav>
      </div>
      <div className="border-t border-[var(--night-600)]">
        <div className="mx-auto flex max-w-container flex-wrap items-center justify-between gap-3 px-6 py-5">
          <span className="text-[0.8125rem]">
            © {new Date().getFullYear()} PubQuizPlanner · {t('tagline')}
          </span>
          {/* Real links (not just labels): the one crawlable cross-locale path
              on every page, so search engines discover all language versions. */}
          <span className="font-mono text-[0.72rem] tracking-[0.04em]">
            {LOCALES.map((l, i) => (
              <span key={l}>
                {i > 0 && ' · '}
                <a
                  href={`/${l}`}
                  hrefLang={l}
                  className={`no-underline transition-colors hover:text-[var(--text-body)] ${
                    l === locale ? 'text-[var(--text-muted)]' : ''
                  }`}
                >
                  {LOCALE_LABELS[l] ?? l}
                </a>
              </span>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}
