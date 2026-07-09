import '../../globals.css';
import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import SiteFooter from '@/components/SiteFooter';
import SiteHeader from '@/components/SiteHeader';
import TrackPageview from '@/components/TrackPageview';
import { isLocale } from '@/config/locales';
import { fontVariables } from '@/lib/fonts';
import { JsonLd, organizationSchema, websiteSchema } from '@/lib/structured-data';

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

  return (
    <html lang={locale} className={fontVariables}>
      <body className="antialiased min-h-screen flex flex-col">
        {/* Site-wide entities — emitted on every public page */}
        <JsonLd data={[organizationSchema(), websiteSchema(locale)]} />
        <NextIntlClientProvider messages={messages}>
          <TrackPageview />
          <SiteHeader locale={locale} />
          <div className="flex-1">{children}</div>
          <SiteFooter locale={locale} />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
