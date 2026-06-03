'use server';
// Owner-only actions. Every one re-checks is_admin on the server, so even
// if someone reached the page they could do nothing without being an admin.
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

// Verify the caller is an admin (via their session), then return a
// service-role client for the write so RLS edge-cases can't block it.
async function adminWriter() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
  if (!p?.is_admin) return null;
  return createAdminClient();
}
import { Category, CommentMode, CommentStatus } from '@/lib/constants';
import { Sponsor, SponsorPlacement } from '@/lib/types';

async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('profiles').select('is_admin').eq('user_id', user.id).single();
  return p?.is_admin ? supabase : null;
}

export async function approveSuggestion(id: string) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topic_suggestions').update({ status: 'approved' }).eq('id', id);
  revalidatePath('/admin'); return { ok: true };
}

export async function rejectSuggestion(id: string) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topic_suggestions').update({ status: 'rejected' }).eq('id', id);
  revalidatePath('/admin'); return { ok: true };
}

export async function createTopic(input: {
  question_tr: string; question_en: string; category: Category;
  options?: { label_tr: string; label_en: string }[];
}) {
  const writer = await adminWriter(); if (!writer) return { ok: false, error: 'not admin' };
  const opts = (input.options ?? []).filter((o) => o.label_tr.trim());
  const isMulti = opts.length >= 2;
  const { data: topic, error } = await writer.from('topics').insert({
    question_tr: input.question_tr, question_en: input.question_en, category: input.category,
    is_active: true, poll_type: isMulti ? 'multi' : 'binary',
  }).select('id').single();

  if (error || !topic?.id) return { ok: false, error: error?.message ?? 'insert failed' };

  if (isMulti) {
    const { error: oerr } = await writer.from('topic_options').insert(
      opts.map((o, i) => ({ topic_id: topic.id, label_tr: o.label_tr.trim(),
        label_en: o.label_en.trim() || null, position: i }))
    );
    if (oerr) return { ok: false, error: oerr.message };
  }
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function setDaily(topicId: string) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topics').update({ is_daily: false }).eq('is_daily', true);
  await sb.from('topics').update({ is_daily: true }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function setActive(topicId: string, active: boolean) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topics').update({ is_active: active }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

// --- Comment settings per topic ---
export async function setCommentsEnabled(topicId: string, enabled: boolean) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topics').update({ comments_enabled: enabled }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

// Schedule a topic to be the daily question on a given date (or clear it).
export async function setScheduledDate(topicId: string, date: string | null) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topics').update({ scheduled_daily_date: date || null }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function setCommentMode(topicId: string, mode: CommentMode) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topics').update({ comment_mode: mode }).eq('id', topicId);
  revalidatePath('/admin'); return { ok: true };
}

// --- Comment moderation ---
export type PendingComment = {
  id: string; body: string; region: string | null; created_at: string;
  topic_id: string;
};

export async function listPendingComments(): Promise<PendingComment[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.from('comments')
    .select('id, body, region, created_at, topic_id')
    .eq('status', 'pending').order('created_at', { ascending: false }).limit(200);
  return (data ?? []) as PendingComment[];
}

export async function moderateComment(id: string, status: CommentStatus) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('comments').update({ status }).eq('id', id);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

// --- Sponsors ---
export async function listSponsors(): Promise<Sponsor[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.from('sponsors')
    .select('id, label_tr, label_en, url, placement, is_active')
    .order('created_at', { ascending: false });
  return (data ?? []) as Sponsor[];
}

export async function createSponsor(input: {
  label_tr: string; label_en: string; url: string; placement: SponsorPlacement;
}) {
  const writer = await adminWriter(); if (!writer) return { ok: false };
  await writer.from('sponsors').insert({ ...input, is_active: true });
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function setSponsorActive(id: string, active: boolean) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('sponsors').update({ is_active: active }).eq('id', id);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function deleteSponsor(id: string) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('sponsors').delete().eq('id', id);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

// --- Analytics ---
export type BreakdownRow = { dimension: string; bucket: string; agree: number; disagree: number };
export type TimePoint = { day: string; agree: number; disagree: number };

export async function getBreakdown(topicId: string): Promise<BreakdownRow[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.rpc('admin_breakdown', { p_topic_id: topicId });
  return (data ?? []) as BreakdownRow[];
}

export async function getTimeseries(topicId: string): Promise<TimePoint[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.rpc('admin_timeseries', { p_topic_id: topicId });
  return (data ?? []) as TimePoint[];
}
