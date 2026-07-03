import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { isLocale } from '@/config/locales';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !isLocale(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`./${locale}.json`)).default,
  };
});
