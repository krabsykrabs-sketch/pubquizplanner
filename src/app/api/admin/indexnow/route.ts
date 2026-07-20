export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getContentUrls } from '@/lib/content-urls';
import { submitToIndexNow } from '@/lib/indexnow';

// Manually resubmit every live content URL to IndexNow. Triggered by the
// admin after publishing content. Protected by the admin middleware.
export async function POST() {
  try {
    const urls = await getContentUrls();
    const result = await submitToIndexNow(urls);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  } catch {
    return NextResponse.json({ ok: false, status: 500, submitted: 0 }, { status: 500 });
  }
}
