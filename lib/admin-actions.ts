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

async function logAudit(action: string, detail: string) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const w = createAdminClient();
    await w.from('admin_audit').insert({ actor: user?.email ?? user?.id ?? 'unknown', action, detail });
  } catch { /* never block the main action on audit logging */ }
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
  image_url?: string; description_tr?: string; description_en?: string; source_url?: string;
  options?: { label_tr: string; label_en: string }[];
}) {
  const writer = await adminWriter(); if (!writer) return { ok: false, error: 'not admin' };
  const opts = (input.options ?? []).filter((o) => o.label_tr.trim());
  const isMulti = opts.length >= 2;
  const { data: topic, error } = await writer.from('topics').insert({
    question_tr: input.question_tr, question_en: input.question_en, category: input.category,
    is_active: true, poll_type: isMulti ? 'multi' : 'binary',
    image_url: input.image_url?.trim() || null,
    description_tr: input.description_tr?.trim() || null,
    description_en: input.description_en?.trim() || null,
    source_url: input.source_url?.trim() || null,
  }).select('id').single();

  if (error || !topic?.id) return { ok: false, error: error?.message ?? 'insert failed' };

  if (isMulti) {
    const { error: oerr } = await writer.from('topic_options').insert(
      opts.map((o, i) => ({ topic_id: topic.id, label_tr: o.label_tr.trim(),
        label_en: o.label_en.trim() || null, position: i }))
    );
    if (oerr) return { ok: false, error: oerr.message };
  }
  await logAudit('create_topic', input.question_tr.slice(0, 80));
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function updateTopicText(topicId: string, question_tr: string, question_en: string) {
  const w = await adminWriter(); if (!w) return { ok: false };
  if (!question_tr.trim() || !question_en.trim()) return { ok: false, error: 'empty' };
  await w.from('topics').update({ question_tr: question_tr.trim(), question_en: question_en.trim() }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

// Update a topic's media/context fields (image, description, source).
export async function updateTopicMeta(topicId: string, input: {
  image_url?: string | null; description_tr?: string | null;
  description_en?: string | null; source_url?: string | null;
}) {
  const w = await adminWriter(); if (!w) return { ok: false };
  await w.from('topics').update({
    image_url: (input.image_url ?? '')?.trim() || null,
    description_tr: (input.description_tr ?? '')?.trim() || null,
    description_en: (input.description_en ?? '')?.trim() || null,
    source_url: (input.source_url ?? '')?.trim() || null,
  }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function addOption(topicId: string, label_tr: string, label_en: string) {
  const w = await adminWriter(); if (!w) return { ok: false };
  if (!label_tr.trim()) return { ok: false };
  const { data: max } = await w.from('topic_options').select('position')
    .eq('topic_id', topicId).order('position', { ascending: false }).limit(1).single();
  await w.from('topic_options').insert({
    topic_id: topicId, label_tr: label_tr.trim(), label_en: label_en.trim() || null,
    position: (max?.position ?? -1) + 1,
  });
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function updateOption(optionId: string, label_tr: string, label_en: string) {
  const w = await adminWriter(); if (!w) return { ok: false };
  await w.from('topic_options').update({ label_tr: label_tr.trim(), label_en: label_en.trim() || null }).eq('id', optionId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function deleteOption(optionId: string) {
  const w = await adminWriter(); if (!w) return { ok: false };
  await w.from('topic_options').delete().eq('id', optionId);
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
  await logAudit('moderate_comment', `${status}`);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

// --- Sponsors ---
export async function listSponsors(): Promise<Sponsor[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.from('sponsors')
    .select('id, label_tr, label_en, url, placement, is_active, impressions, clicks')
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

export type OptionBreakdownRow = { dimension: string; bucket: string; option_label: string; votes: number };
export async function getOptionBreakdown(topicId: string): Promise<OptionBreakdownRow[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.rpc('admin_option_breakdown', { p_topic_id: topicId });
  return (data ?? []) as OptionBreakdownRow[];
}

export type Overview = { total_votes: number; votes_today: number; total_topics: number; total_comments: number; total_users: number };
export async function getOverview(): Promise<Overview | null> {
  const sb = await requireAdmin(); if (!sb) return null;
  const { data } = await sb.rpc('admin_overview');
  return ((data ?? [])[0] ?? null) as Overview | null;
}

export type AuditRow = { id: string; actor: string | null; action: string; detail: string | null; created_at: string };
export async function listAudit(): Promise<AuditRow[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.from('admin_audit').select('*').order('created_at', { ascending: false }).limit(100);
  return (data ?? []) as AuditRow[];
}

// --- People: collected profiles (admin-only, via service role) --------
export type PersonRow = {
  user_id: string; is_banned: boolean; is_admin: boolean;
  first_name: string | null; last_name: string | null; date_of_birth: string | null;
  region: string | null; gender: string | null; marital_status: string | null;
  employment: string | null; education: string | null; origin: string | null;
  phone: string | null; created_at: string;
};
export async function getPeople(): Promise<PersonRow[]> {
  const writer = await adminWriter(); if (!writer) return [];
  const { data } = await writer.from('profiles')
    .select('user_id, is_banned, is_admin, first_name, last_name, date_of_birth, region, gender, marital_status, employment, education, origin, phone, created_at')
    .order('created_at', { ascending: false })
    .limit(2000);
  return (data ?? []) as PersonRow[];
}

// Ban or unban an account. Admins cannot be banned.
export async function setBanned(userId: string, banned: boolean) {
  const writer = await adminWriter(); if (!writer) return { ok: false as const };
  const { data: target } = await writer.from('profiles').select('is_admin').eq('user_id', userId).single();
  if (target?.is_admin) return { ok: false as const, reason: 'cannot_ban_admin' as const };
  await writer.from('profiles').update({ is_banned: banned }).eq('user_id', userId);
  await logAudit(banned ? 'ban_user' : 'unban_user', userId);
  revalidatePath('/admin');
  return { ok: true as const };
}

// --- Error log (admin Errors tab) ------------------------------------
export type AppError = { id: string; message: string | null; stack: string | null; path: string | null; kind: string | null; created_at: string };
export async function getErrors(): Promise<AppError[]> {
  const sb = await requireAdmin(); if (!sb) return [];
  const { data } = await sb.from('app_errors').select('*').order('created_at', { ascending: false }).limit(100);
  return (data ?? []) as AppError[];
}
export async function clearErrors() {
  const writer = await adminWriter(); if (!writer) return { ok: false as const };
  await writer.from('app_errors').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  revalidatePath('/admin');
  return { ok: true as const };
}

// --- Site announcement banner ----------------------------------------
export type AnnouncementSettings = { announcement_tr: string | null; announcement_en: string | null; announcement_active: boolean };
export async function getAnnouncementSettings(): Promise<AnnouncementSettings | null> {
  const sb = await requireAdmin(); if (!sb) return null;
  const { data } = await sb.from('site_settings').select('announcement_tr, announcement_en, announcement_active').eq('id', 1).single();
  return (data ?? null) as AnnouncementSettings | null;
}
export async function setAnnouncement(input: { tr: string; en: string; active: boolean }) {
  const writer = await adminWriter(); if (!writer) return { ok: false as const };
  await writer.from('site_settings').update({
    announcement_tr: input.tr.trim() || null,
    announcement_en: input.en.trim() || null,
    announcement_active: input.active,
    updated_at: new Date().toISOString(),
  }).eq('id', 1);
  await logAudit('set_announcement', input.active ? 'on' : 'off');
  revalidatePath('/'); revalidatePath('/admin');
  return { ok: true as const };
}

// --- Delete a topic (and its votes/comments via cascade) -------------
export async function deleteTopic(id: string) {
  const writer = await adminWriter(); if (!writer) return { ok: false as const };
  await writer.from('topics').delete().eq('id', id);
  await logAudit('delete_topic', id);
  revalidatePath('/'); revalidatePath('/admin');
  return { ok: true as const };
}

// --- Vote counts per topic (for the admin topic list) ----------------
export async function getTopicCounts(): Promise<Record<string, number>> {
  const sb = await requireAdmin(); if (!sb) return {};
  const { data } = await sb.rpc('topic_counts');
  const out: Record<string, number> = {};
  for (const r of (data ?? []) as { topic_id: string; votes: number }[]) out[r.topic_id] = r.votes;
  return out;
}

// --- Dashboard: votes per day for the last N days ---------------------
export type DayVotes = { day: string; votes: number };
export async function getVotesByDay(days = 14): Promise<DayVotes[]> {
  const writer = await adminWriter(); if (!writer) return [];
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data } = await writer.from('votes').select('created_at').gte('created_at', since).limit(50000);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as { created_at: string }[]) {
    const d = r.created_at.slice(0, 10);
    map.set(d, (map.get(d) ?? 0) + 1);
  }
  const out: DayVotes[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
    out.push({ day: d, votes: map.get(d) ?? 0 });
  }
  return out;
}

// --- Dashboard: most-voted topics since midnight (server time) --------
export type TopPoll = { topic_id: string; votes: number };
export async function getTopPollsToday(): Promise<TopPoll[]> {
  const writer = await adminWriter(); if (!writer) return [];
  const start = new Date(); start.setHours(0, 0, 0, 0);
  const { data } = await writer.from('votes').select('topic_id').gte('created_at', start.toISOString()).limit(50000);
  const map = new Map<string, number>();
  for (const r of (data ?? []) as { topic_id: string }[]) map.set(r.topic_id, (map.get(r.topic_id) ?? 0) + 1);
  return Array.from(map, ([topic_id, votes]) => ({ topic_id, votes }))
    .sort((a, b) => b.votes - a.votes).slice(0, 5);
}

// --- Dashboard: counts for tab badges (pending comments, errors) ------
export type PendingCounts = { comments: number; errors: number };
export async function getPendingCounts(): Promise<PendingCounts> {
  const sb = await requireAdmin(); if (!sb) return { comments: 0, errors: 0 };
  const { count: comments } = await sb.from('comments')
    .select('id', { count: 'exact', head: true }).eq('status', 'pending');
  const { count: errors } = await sb.from('app_errors')
    .select('id', { count: 'exact', head: true });
  return { comments: comments ?? 0, errors: errors ?? 0 };
}
