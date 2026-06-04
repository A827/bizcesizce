'use server';
// Server-side actions. These run on the server, never in the browser,
// so they can safely enforce rules and read the signed-in user.
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Choice, Region, AgeBand, Gender, Education, Employment, Origin, MaritalStatus, ageBandFromDob } from '@/lib/constants';
import { Comment, OptionResult, Sponsor, SponsorPlacement } from '@/lib/types';
import { createAdminClient } from '@/lib/supabase/admin';
import { moderateText } from '@/lib/moderation';
import { verifyTurnstile } from '@/lib/turnstile';

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

// --- Cast a vote on a multiple-choice option ---
export async function castVoteOption(topicId: string, optionId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' as const };

  const { data: p } = await supabase
    .from('profiles')
    .select('region, age_band, gender, education, employment, origin')
    .eq('user_id', user.id).single();
  if (!p?.region || !p?.age_band) return { ok: false, reason: 'no_profile' as const };

  const { error } = await supabase.from('votes').insert({
    topic_id: topicId, user_id: user.id, option_id: optionId,
    region: p.region, age_band: p.age_band,
    gender: p.gender, education: p.education, employment: p.employment, origin: p.origin,
  });
  if (error) {
    if (error.code === '23505') return { ok: false, reason: 'already_voted' as const };
    if (error.code === '23514' || /rate_limit/.test(error.message)) return { ok: false, reason: 'rate_limited' as const };
    return { ok: false, reason: 'error' as const };
  }
  revalidatePath('/');
  return { ok: true as const };
}

// --- Per-option results (aggregate only) ---
export async function getOptionResults(topicId: string): Promise<OptionResult[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('topic_option_results', { p_topic_id: topicId });
  return (data ?? []) as OptionResult[];
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
    .select('id, topic_id, body, status, region, author_name, created_at')
    .eq('topic_id', topicId)
    .order('created_at', { ascending: false })
    .limit(100);
  return (data ?? []) as Comment[];
}

// --- Sponsors (public reads active ones for a placement) ---
export async function getSponsors(placement: SponsorPlacement): Promise<Sponsor[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('sponsors')
    .select('id, label_tr, label_en, url, placement, is_active')
    .eq('placement', placement).eq('is_active', true);
  return (data ?? []) as Sponsor[];
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

// --- Complete first-run profile setup (gated by Turnstile human check) ---
// Core fields (region, date_of_birth, gender) are required; everything else
// is optional. age_band is derived from the birth date for vote breakdowns.
export type SetupInput = {
  region: Region;
  date_of_birth: string;        // ISO yyyy-mm-dd
  gender: Gender;
  first_name?: string | null;
  last_name?: string | null;
  marital_status?: MaritalStatus | null;
  employment?: Employment | null;   // "job"
  education?: Education | null;
  origin?: Origin | null;
  phone?: string | null;
};

export async function completeSetup(input: SetupInput, turnstileToken: string | null) {
  const human = await verifyTurnstile(turnstileToken);
  if (!human) return { ok: false, reason: 'not_human' as const };

  if (!input.region || !input.gender || !input.date_of_birth) {
    return { ok: false, reason: 'missing_core' as const };
  }
  const age_band = ageBandFromDob(input.date_of_birth);
  if (!age_band) return { ok: false, reason: 'too_young' as const };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' as const };

  const clean = (s?: string | null) => {
    const v = (s ?? '').trim();
    return v.length ? v.slice(0, 60) : null;
  };

  const { error } = await supabase.from('profiles').update({
    region: input.region,
    age_band,
    date_of_birth: input.date_of_birth,
    gender: input.gender,
    first_name: clean(input.first_name),
    last_name: clean(input.last_name),
    marital_status: input.marital_status ?? null,
    employment: input.employment ?? null,
    education: input.education ?? null,
    origin: input.origin ?? null,
    phone: (input.phone ?? '').trim().slice(0, 30) || null,
  }).eq('user_id', user.id);

  if (error) return { ok: false, reason: 'error' as const };
  revalidatePath('/');
  return { ok: true as const };
}

// --- My profile (the signed-in user's own data) -----------------------
export type MyProfile = {
  first_name: string | null; last_name: string | null; date_of_birth: string | null;
  region: string | null; age_band: string | null; gender: string | null;
  marital_status: string | null; employment: string | null; education: string | null;
  origin: string | null; phone: string | null; created_at: string;
};

export async function getMyProfile(): Promise<MyProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('profiles')
    .select('first_name, last_name, date_of_birth, region, age_band, gender, marital_status, employment, education, origin, phone, created_at')
    .eq('user_id', user.id).single();
  return (data ?? null) as MyProfile | null;
}

// Only the safe-to-change fields. Demographics stay locked (DB trigger
// also enforces this) to keep vote breakdowns honest.
export async function updateProfile(input: {
  first_name?: string | null; last_name?: string | null;
  phone?: string | null; marital_status?: MaritalStatus | null;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, reason: 'not_signed_in' as const };
  const clean = (s?: string | null) => { const v = (s ?? '').trim(); return v.length ? v.slice(0, 60) : null; };
  const { error } = await supabase.from('profiles').update({
    first_name: clean(input.first_name),
    last_name: clean(input.last_name),
    phone: (input.phone ?? '').trim().slice(0, 30) || null,
    marital_status: input.marital_status ?? null,
  }).eq('user_id', user.id);
  if (error) return { ok: false, reason: 'error' as const };
  revalidatePath('/profile');
  return { ok: true as const };
}
