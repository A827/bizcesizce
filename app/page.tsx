import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getResults } from '@/lib/actions';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Feed } from '@/components/Feed';
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

  const list = (topics ?? []) as Topic[];
  const voteMap = new Map((myVotes ?? []).map((v) => [v.topic_id, v.choice]));

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
        <Link href="/suggest" className="btn btn-block" style={{ marginTop: 24 }}>
          <SuggestLabel />
        </Link>
        <Footer />
      </main>
    </>
  );
}
