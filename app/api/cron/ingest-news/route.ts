import { NextRequest, NextResponse } from 'next/server';
import { ingestNews } from '@/lib/news';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Called daily by Vercel Cron (see vercel.json). Vercel automatically sends
// "Authorization: Bearer <CRON_SECRET>" when CRON_SECRET is set, so we reject
// anything else. If no secret is configured we still run (e.g. first setup).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }
  }
  const result = await ingestNews(4);
  return NextResponse.json(result);
}
