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
            <p className="mt-2 text-xs">
              Einige Fragen basieren auf der{' '}
              <a
                href="https://opentdb.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                Open Trivia Database
              </a>{' '}
              (<a
                href={`/${locale}/credits`}
                className="underline hover:text-[var(--foreground)] transition-colors"
              >
                CC BY-SA 4.0
              </a>)
            </p>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
