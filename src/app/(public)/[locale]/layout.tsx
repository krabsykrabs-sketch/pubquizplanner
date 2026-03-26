import '../../globals.css';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['de', 'en'];

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale)) notFound();

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="antialiased min-h-screen flex flex-col">
        <NextIntlClientProvider messages={messages}>
          <div className="flex-1">{children}</div>
          <footer className="border-t border-[var(--dark-border)] py-8 text-center text-sm text-[var(--muted)]">
            <p>© 2026 PubQuizPlanner · Erstellt mit ❤️ für Quizmaster</p>
            <p className="mt-3 text-xs space-x-2">
              <a
                href={`/${locale}/impressum`}
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                Impressum
              </a>
              <span>|</span>
              <a
                href={`/${locale}/datenschutz`}
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                Datenschutz
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
