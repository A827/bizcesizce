'use server';
// Server-side actions. These run on the server, never in the browser,
// so they can safely enforce rules and read the signed-in user.
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Choice } from '@/lib/constants';

export type RegionResult = { region: string; agree: number; disagree: number };
export type TopicResults = { total_agree: number; total_disagree: number; regions: RegionResult[] };

// --- Cast a vote (one per person per topic, enforced by the database) ---
export async function castVote(topicId: string, choice: Choice) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' as const };

  // Read the voter's region/age to copy onto the vote.
  const { data: profile } = await supabase
    .from('profiles').select('region, age_band').eq('user_id', user.id).single();
  if (!profile?.region || !profile?.age_band) return { ok: false, reason: 'no_profile' as const };

  const { error } = await supabase.from('votes').insert({
    topic_id: topicId, user_id: user.id, choice,
    region: profile.region, age_band: profile.age_band,
  });

  // A duplicate vote trips the unique constraint — treat as "already voted".
  if (error) {
    const already = error.code === '23505';
    return { ok: false, reason: already ? ('already_voted' as const) : ('error' as const) };
  }

  revalidatePath('/');
  return { ok: true as const, choice };
}

// --- Read aggregate results for one topic (never individual votes) ---
export async function getResults(topicId: string): Promise<TopicResults> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('topic_results', { p_topic_id: topicId });
  const rows = (data ?? []) as { region: string; agree_count: number; disagree_count: number }[];
  const totalRow = rows.find((r) => r.region === 'TOTAL');
  return {
    total_agree: totalRow?.agree_count ?? 0,
    total_disagree: totalRow?.disagree_count ?? 0,
    regions: rows.filter((r) => r.region !== 'TOTAL')
      .map((r) => ({ region: r.region, agree: r.agree_count, disagree: r.disagree_count }))
      .sort((a, b) => (b.agree + b.disagree) - (a.agree + a.disagree)),
  };
}
