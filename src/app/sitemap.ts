import { MetadataRoute } from 'next';
import { getContentUrls, BASE_URL } from '@/lib/content-urls';

export const dynamic = 'force-dynamic';

// Rough priority by URL shape: home > generator/index > category pages >
// legal pages. The shared getContentUrls() decides *which* URLs are live.
function priorityFor(url: string): number {
  const path = url.slice(BASE_URL.length);
  if (/^\/[a-z]{2}$/.test(path)) return 1.0;
  if (/(generator|fragen|vragen|pytania|fragor|questions|preguntas|perguntas)$/.test(path))
    return 0.9;
  if (/(impressum|datenschutz|credits)$/.test(path)) return 0.3;
  return 0.8;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    const urls = await getContentUrls();
    return urls.map((url) => ({
      url,
      changeFrequency: 'weekly',
      priority: priorityFor(url),
    }));
  } catch {
    // DB unavailable at build time — static pages only
    return [
      { url: `${BASE_URL}/de`, changeFrequency: 'weekly', priority: 1.0 },
      { url: `${BASE_URL}/de/generator`, changeFrequency: 'weekly', priority: 0.9 },
      { url: `${BASE_URL}/de/fragen`, changeFrequency: 'weekly', priority: 0.9 },
    ];
  }
}
