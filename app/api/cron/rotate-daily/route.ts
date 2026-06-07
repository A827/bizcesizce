import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, dailyDigestEmail } from '@/lib/email';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type T = { id: string; question_tr: string; is_daily: boolean;
  scheduled_daily_date: string | null; last_daily_on: string | null; created_at: string };

// Daily Vercel cron: rotate the "question of the day" and email a digest to
// opted-in users. Honours a manually scheduled date for today; otherwise
// rotates fairly through active polls (least-recently-daily first).
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  const db = createAdminClient();
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Nicosia' });

  const { data: topics } = await db.from('topics')
    .select('id, question_tr, is_daily, scheduled_daily_date, last_daily_on, created_at')
    .eq('is_active', true);
  const list = (topics ?? []) as T[];
  if (list.length === 0) return NextResponse.json({ ok: false, message: 'no active topics' });

  let chosen = list.find((t) => t.scheduled_daily_date === today);
  if (!chosen) {
    const pool = (list.some((t) => !t.is_daily) ? list.filter((t) => !t.is_daily) : list).slice();
    pool.sort((a, b) => {
      const la = a.last_daily_on ?? '', lb = b.last_daily_on ?? '';
      if (la !== lb) return la < lb ? -1 : 1;          // never/oldest daily first
      return a.created_at > b.created_at ? -1 : 1;      // newer first as tiebreak
    });
    chosen = pool[0];
  }
  if (!chosen) return NextResponse.json({ ok: false, message: 'no choice' });

  await db.from('topics').update({ is_daily: false }).eq('is_daily', true);
  await db.from('topics').update({ is_daily: true, last_daily_on: today }).eq('id', chosen.id);

  // Daily digest (only if email is configured).
  let digestSent = 0;
  if (process.env.RESEND_API_KEY) {
    try {
      const { data: profs } = await db.from('profiles')
        .select('user_id, unsubscribe_token').eq('notify_daily', true).eq('is_banned', false);
      if (profs && profs.length) {
        const { data: users } = await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
        const emailById = new Map((users?.users ?? []).map((u) => [u.id, u.email] as const));
        for (const p of profs as { user_id: string; unsubscribe_token: string }[]) {
          const email = emailById.get(p.user_id);
          if (!email) continue;
          const tpl = dailyDigestEmail(chosen.question_tr, chosen.id, p.unsubscribe_token);
          if (await sendEmail(email, tpl.subject, tpl.html)) digestSent++;
        }
      }
    } catch { /* digest is best-effort */ }
  }

  revalidatePath('/');
  return NextResponse.json({ ok: true, daily: chosen.question_tr, digestSent });
}
