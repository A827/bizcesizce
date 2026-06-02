'use server';
// Owner-only actions. Every one re-checks is_admin on the server, so even
// if someone reached the page they could do nothing without being an admin.
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { Category } from '@/lib/constants';

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
}) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topics').insert({ ...input, is_active: true });
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function setDaily(topicId: string) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  // Clear any existing daily first (only one allowed by the database).
  await sb.from('topics').update({ is_daily: false }).eq('is_daily', true);
  await sb.from('topics').update({ is_daily: true }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}

export async function setActive(topicId: string, active: boolean) {
  const sb = await requireAdmin(); if (!sb) return { ok: false };
  await sb.from('topics').update({ is_active: active }).eq('id', topicId);
  revalidatePath('/admin'); revalidatePath('/'); return { ok: true };
}
