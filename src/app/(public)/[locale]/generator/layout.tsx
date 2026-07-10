import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import {
  SOURCE_LOCALE,
  OG_LOCALE,
  localeAlternates,
  type Locale,
} from '@/config/locales';

// The generator page itself is a client component and cannot export metadata,
// so canonical/hreflang/title live in this pass-through layout. Without a
// canonical, Google files the locale variants under "duplicate without
// user-selected canonical" and skips them.
export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const tGen = await getTranslations({ locale, namespace: 'generator' });
  const tMeta = await getTranslations({ locale, namespace: 'meta' });
  return {
    title: `${tGen('title')} | PubQuizPlanner`,
    description: tMeta('description'),
    alternates: {
      canonical: `/${locale}/generator`,
      languages: localeAlternates('/generator'),
    },
    openGraph: {
      title: `${tGen('title')} | PubQuizPlanner`,
      description: tMeta('description'),
      url: `/${locale}/generator`,
      siteName: 'PubQuizPlanner',
      locale: OG_LOCALE[locale as Locale] ?? OG_LOCALE[SOURCE_LOCALE],
      type: 'website',
    },
  };
}

export default function GeneratorLayout({ children }: { children: React.ReactNode }) {
  return children;
}
