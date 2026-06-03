import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getResults } from '@/lib/actions';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Feed } from '@/components/Feed';
import { SponsorSlot } from '@/components/SponsorSlot';
import { SuggestLabel } from '@/components/SuggestLabel';
import { Topic } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Voting is blocked until the profile is complete.
  const { data: profile } = await supabase
    .from('profiles').select('region, age_band').eq('user_id', user.id).single();
  if (!profile?.region || !profile?.age_band) redirect('/setup');

  const { data: topics } = await supabase
    .from('topics').select('*').eq('is_active', true)
    .order('is_daily', { ascending: false })
    .order('created_at', { ascending: false });

  const { data: myVotes } = await supabase
    .from('votes').select('topic_id, choice').eq('user_id', user.id);

  const rawList = (topics ?? []) as Topic[];
  const voteMap = new Map((myVotes ?? []).map((v) => [v.topic_id, v.choice]));

  // Decide today's daily question. Prefer the one scheduled for today's date
  // (Cyprus time); otherwise fall back to a topic flagged is_daily.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Nicosia' });
  const scheduledToday = rawList.find((t) => t.scheduled_daily_date === today);
  const effectiveDailyId = scheduledToday?.id ?? rawList.find((t) => t.is_daily)?.id ?? null;

  // Override the is_daily flag for rendering, and float the daily card to top.
  const list = rawList
    .map((t) => ({ ...t, is_daily: t.id === effectiveDailyId }))
    .sort((a, b) => (a.is_daily === b.is_daily ? 0 : a.is_daily ? -1 : 1));

  // Pre-load results only for topics the user has already voted on (so the
  // reveal shows instantly without leaking results before voting).
  const enriched = await Promise.all(list.map(async (topic) => {
    const choice = voteMap.get(topic.id) ?? null;
    const results = choice ? await getResults(topic.id) : null;
    return { topic, vote: choice ? { topic_id: topic.id, choice } : null, results };
  }));

  return (
    <>
      <Header />
      <main className="shell">
        <Feed items={enriched} />
        <SponsorSlot placement="feed" />
        <Link href="/suggest" className="btn btn-block" style={{ marginTop: 24 }}>
          <SuggestLabel />
        </Link>
        <Footer />
      </main>
    </>
  );
}
