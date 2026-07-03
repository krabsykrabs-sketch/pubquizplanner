import '../../globals.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import TrackPageview from '@/components/TrackPageview';
import { isLocale } from '@/config/locales';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL('https://pubquizplanner.com'),
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(locale)) notFound();

  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: 'footer' });

  return (
    <html lang={locale}>
      <body className="antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <TrackPageview />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-[var(--dark-border)] py-8 text-center text-sm text-[var(--muted)]">
            <p>© {new Date().getFullYear()} PubQuizPlanner · {t('tagline')}</p>
            <p className="mt-3 text-xs space-x-2">
              <a
                href={`/${locale}/fragen`}
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                {t('questions')}
              </a>
              <span>|</span>
              <a
                href={`/${locale}/impressum`}
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                {t('impressum')}
              </a>
              <span>|</span>
              <a
                href={`/${locale}/datenschutz`}
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                {t('privacy')}
              </a>
              <span>|</span>
              <a
                href={`/${locale}/credits`}
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                Credits
              </a>
            </p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
