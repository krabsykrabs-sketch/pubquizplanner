import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

const BASE_URL = 'https://pubquizplanner.com';
const MIN_QUESTIONS = 30;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let categories: { slug: string }[] = [];
  try {
    categories = await query<{ slug: string }>(
      `SELECT c.slug
       FROM categories c
       JOIN questions q ON q.category_id = c.id
       WHERE q.status = 'approved'
       GROUP BY c.id, c.slug
       HAVING COUNT(q.id) >= $1
       ORDER BY c.slug`,
      [MIN_QUESTIONS]
    );
  } catch {
    // DB unavailable at build time — use known slugs as fallback
    categories = [
      'allgemeinwissen', 'film-tv', 'geographie', 'geschichte',
      'literatur', 'musik', 'sport', 'wissenschaft',
    ].map((slug) => ({ slug }));
  }

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/de`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE_URL}/de/generator`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/de/fragen`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/de/impressum`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/de/datenschutz`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/de/credits`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const categoryPages: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/de/fragen/${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...categoryPages];
}
