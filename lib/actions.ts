'use server';
// Server-side actions. These run on the server, never in the browser,
// so they can safely enforce rules and read the signed-in user.
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Choice } from '@/lib/constants';
import { Comment } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { moderateText } from '@/lib/moderation';

export type RegionResult = { region: string; agree: number; disagree: number };
export type TopicResults = { total_agree: number; total_disagree: number; regions: RegionResult[] };

// --- Cast a vote (one per person per topic, enforced by the database) ---
export async function castVote(topicId: string, choice: Choice) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' as const };

  // Read the voter's profile to copy demographics onto the vote.
  const { data: p } = await supabase
    .from('profiles')
    .select('region, age_band, gender, education, employment, origin')
    .eq('user_id', user.id).single();
  if (!p?.region || !p?.age_band) return { ok: false, reason: 'no_profile' as const };

  const { error } = await supabase.from('votes').insert({
    topic_id: topicId, user_id: user.id, choice,
    region: p.region, age_band: p.age_band,
    gender: p.gender, education: p.education, employment: p.employment, origin: p.origin,
  });

  if (error) {
    if (error.code === '23505') return { ok: false, reason: 'already_voted' as const };
    if (error.code === '23514' || /rate_limit/.test(error.message)) return { ok: false, reason: 'rate_limited' as const };
    return { ok: false, reason: 'error' as const };
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

// --- Comments -------------------------------------------------------
export async function getComments(topicId: string): Promise<Comment[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('comments')
    .select('id, topic_id, body, status, region, created_at')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })
    .limit(100);
  return (data ?? []) as Comment[];
}

export async function postComment(topicId: string, body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' as const };
  const trimmed = body.trim();
  if (!trimmed || trimmed.length > 600) return { ok: false, reason: 'invalid' as const };

  const { data: inserted, error } = await supabase.from('comments').insert({
    topic_id: topicId, user_id: user.id, body: trimmed,
  }).select('id').single();

  if (error) {
    // Rate-limit trigger raises a check_violation when posting too fast.
    if (error.code === '23514' || /rate_limit/.test(error.message)) {
      return { ok: false, reason: 'rate_limited' as const };
    }
    return { ok: false, reason: 'error' as const };
  }

  // Auto-moderation: for 'auto' topics, ask the AI moderator and flip status.
  const { data: topic } = await supabase
    .from('topics').select('comment_mode').eq('id', topicId).single();
  if (topic?.comment_mode === 'auto' && inserted?.id) {
    const decision = await moderateText(trimmed);
    if (decision === 'approve' || decision === 'reject') {
      const admin = createAdminClient();
      await admin.from('comments')
        .update({ status: decision === 'approve' ? 'approved' : 'rejected' })
        .eq('id', inserted.id);
    }
  }

  revalidatePath('/');
  return { ok: true as const };
}
