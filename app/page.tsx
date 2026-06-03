import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getResults, getOptionResults } from '@/lib/actions';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Feed } from '@/components/Feed';
import { SponsorSlot } from '@/components/SponsorSlot';
import { SuggestLabel } from '@/components/SuggestLabel';
import { Topic, TopicOption } from '@/lib/types';

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

  const rawList = (topics ?? []) as Topic[];

  // Total vote counts per topic (aggregate) for the "trending" sort.
  const { data: countRows } = await supabase.rpc('topic_counts');
  const counts: Record<string, number> = {};
  for (const r of (countRows ?? []) as { topic_id: string; votes: number }[]) counts[r.topic_id] = r.votes;

  const { data: myVotes } = await supabase
    .from('votes').select('topic_id, choice, option_id').eq('user_id', user.id);
  const choiceMap = new Map((myVotes ?? []).map((v) => [v.topic_id, v.choice as ('agree'|'disagree'|null)]));
  const optionVoteMap = new Map((myVotes ?? []).map((v) => [v.topic_id, v.option_id as (string|null)]));

  // Load options for any multiple-choice topics in one query.
  const multiIds = rawList.filter((t) => t.poll_type === 'multi').map((t) => t.id);
  const { data: allOptions } = multiIds.length
    ? await supabase.from('topic_options').select('id, topic_id, label_tr, label_en, position')
        .in('topic_id', multiIds).order('position', { ascending: true })
    : { data: [] as (TopicOption & { topic_id: string })[] };
  const optionsByTopic = new Map<string, TopicOption[]>();
  for (const o of (allOptions ?? []) as (TopicOption & { topic_id: string })[]) {
    const arr = optionsByTopic.get(o.topic_id) ?? [];
    arr.push({ id: o.id, label_tr: o.label_tr, label_en: o.label_en, position: o.position });
    optionsByTopic.set(o.topic_id, arr);
  }

  // Decide today's daily question. Prefer the one scheduled for today's date
  // (Cyprus time); otherwise fall back to a topic flagged is_daily.
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Nicosia' });
  const scheduledToday = rawList.find((t) => t.scheduled_daily_date === today);
  const effectiveDailyId = scheduledToday?.id ?? rawList.find((t) => t.is_daily)?.id ?? null;

  // Override the is_daily flag for rendering, attach options, float daily to top.
  const list = rawList
    .map((t) => ({ ...t, is_daily: t.id === effectiveDailyId, options: optionsByTopic.get(t.id) }))
    .sort((a, b) => (a.is_daily === b.is_daily ? 0 : a.is_daily ? -1 : 1));

  // Pre-load results only for topics the user has already voted on (so the
  // reveal shows instantly without leaking results before voting).
  const enriched = await Promise.all(list.map(async (topic) => {
    const myChoice = choiceMap.get(topic.id) ?? null;
    const myOptionId = optionVoteMap.get(topic.id) ?? null;
    const votedHere = myChoice !== null || myOptionId !== null;
    const isMulti = topic.poll_type === 'multi';
    return {
      topic,
      myChoice,
      myOptionId,
      results: votedHere && !isMulti ? await getResults(topic.id) : null,
      optionResults: votedHere && isMulti ? await getOptionResults(topic.id) : null,
    };
  }));

  return (
    <>
      <Header />
      <main className="shell">
        <Feed items={enriched} counts={counts} />
        <SponsorSlot placement="feed" />
        <Link href="/suggest" className="btn btn-block" style={{ marginTop: 24 }}>
          <SuggestLabel />
        </Link>
        <Footer />
      </main>
    </>
  );
}
