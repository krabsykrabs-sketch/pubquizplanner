import { MetadataRoute } from 'next';
import { query } from '@/lib/db';
import {
  SOURCE_LOCALE,
  EXTRA_LOCALES,
  MIN_QUESTIONS_PER_CATEGORY as MIN_QUESTIONS,
} from '@/config/locales';
import { categoryPath, questionsIndexPath } from '@/config/slugs';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://pubquizplanner.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/${SOURCE_LOCALE}`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/${SOURCE_LOCALE}/generator`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/${SOURCE_LOCALE}/fragen`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/${SOURCE_LOCALE}/impressum`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/${SOURCE_LOCALE}/datenschutz`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/${SOURCE_LOCALE}/credits`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
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
      entries.push({
        url: `${BASE_URL}${categoryPath(SOURCE_LOCALE, cat.slug)}`,
        changeFrequency: 'weekly',
        priority: 0.8,
      });
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
      entries.push(
        { url: `${BASE_URL}/${locale}`, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${BASE_URL}/${locale}/generator`, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${BASE_URL}${questionsIndexPath(locale)}`, changeFrequency: 'weekly', priority: 0.8 }
      );
      for (const cat of cats) {
        entries.push({
          url: `${BASE_URL}${categoryPath(locale, cat.slug)}`,
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } catch {
    // DB unavailable at build time — static pages only
  }

  return entries;
}
