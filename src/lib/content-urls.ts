import { query } from '@/lib/db';
import {
  SOURCE_LOCALE,
  EXTRA_LOCALES,
  MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS,
} from '@/config/locales';
import { categoryPath, questionsIndexPath } from '@/config/slugs';

export const BASE_URL = 'https://pubquizplanner.com';

// Every indexable public URL, in the same visibility rules the pages
// themselves use. Shared by the sitemap and the IndexNow submitter so the two
// never drift. Returns absolute URLs.
export async function getContentUrls(): Promise<string[]> {
  const urls: string[] = [
    `${BASE_URL}/${SOURCE_LOCALE}`,
    `${BASE_URL}/${SOURCE_LOCALE}/generator`,
    `${BASE_URL}/${SOURCE_LOCALE}/fragen`,
    `${BASE_URL}/${SOURCE_LOCALE}/impressum`,
    `${BASE_URL}/${SOURCE_LOCALE}/datenschutz`,
    `${BASE_URL}/${SOURCE_LOCALE}/credits`,
  ];

  const deCategories = await query<{ slug: string }>(
    `SELECT c.slug
     FROM categories c
     JOIN questions q ON q.category_id = c.id
     WHERE q.status = 'approved'
     GROUP BY c.id, c.slug
     HAVING COUNT(q.id) >= $1
     ORDER BY c.slug`,
    [MIN_QUESTIONS]
  );
  for (const cat of deCategories) {
    urls.push(`${BASE_URL}${categoryPath(SOURCE_LOCALE, cat.slug)}`);
  }

  for (const locale of EXTRA_LOCALES) {
    const cats = await query<{ slug: string }>(
      `SELECT c.slug
       FROM categories c
       JOIN questions q ON q.category_id = c.id AND q.status = 'approved'
       JOIN question_translations t ON t.question_id = q.id
         AND t.locale = $2 AND t.status IN ('machine', 'reviewed')
       GROUP BY c.id, c.slug
       HAVING COUNT(q.id) >= $1
       ORDER BY c.slug`,
      [MIN_QUESTIONS, locale]
    );
    if (cats.length === 0) continue; // locale not live yet
    urls.push(
      `${BASE_URL}/${locale}`,
      `${BASE_URL}/${locale}/generator`,
      `${BASE_URL}${questionsIndexPath(locale)}`
    );
    for (const cat of cats) {
      urls.push(`${BASE_URL}${categoryPath(locale, cat.slug)}`);
    }
  }

  return urls;
}
