import { BASE_URL } from '@/lib/content-urls';

// IndexNow lets us tell Bing (and Yandex, Seznam, …) a URL changed instead of
// waiting for a recrawl. The key is not a secret — it's served publicly at
// /<key>.txt to prove ownership — so committing it is fine. Overridable via
// env in case the file is ever rotated.
export const INDEXNOW_KEY =
  process.env.INDEXNOW_KEY || '3b8ebc8ee91cd53b06b9cf7d63af896e';

const HOST = new URL(BASE_URL).host;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

export interface IndexNowResult {
  ok: boolean;
  status: number;
  submitted: number;
}

// Submit a batch of absolute URLs. IndexNow caps a batch at 10,000 URLs, which
// we're nowhere near, so a single POST is enough.
export async function submitToIndexNow(urls: string[]): Promise<IndexNowResult> {
  const urlList = urls.filter((u) => u.startsWith(BASE_URL));
  if (urlList.length === 0) return { ok: true, status: 200, submitted: 0 };

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  // 200 = accepted, 202 = accepted (queued). Both are success.
  return { ok: res.ok, status: res.status, submitted: urlList.length };
}
