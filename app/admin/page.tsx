import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { AdminPanel } from './AdminPanel';
import { Topic, TopicOption } from '@/lib/types';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('user_id', user.id).single();
  if (!profile?.is_admin) redirect('/');

  const { data: topics } = await supabase
    .from('topics').select('*').order('created_at', { ascending: false });
  const { data: suggestions } = await supabase
    .from('topic_suggestions').select('*').eq('status', 'pending')
    .order('created_at', { ascending: false });

  // Attach options to multiple-choice topics so they can be edited.
  const list = (topics ?? []) as Topic[];
  const multiIds = list.filter((t) => t.poll_type === 'multi').map((t) => t.id);
  const { data: allOptions } = multiIds.length
    ? await supabase.from('topic_options').select('id, topic_id, label_tr, label_en, position')
        .in('topic_id', multiIds).order('position', { ascending: true })
    : { data: [] as (TopicOption & { topic_id: string })[] };
  const byTopic = new Map<string, TopicOption[]>();
  for (const o of (allOptions ?? []) as (TopicOption & { topic_id: string })[]) {
    const a = byTopic.get(o.topic_id) ?? [];
    a.push({ id: o.id, label_tr: o.label_tr, label_en: o.label_en, position: o.position });
    byTopic.set(o.topic_id, a);
  }
  const withOptions = list.map((t) => ({ ...t, options: byTopic.get(t.id) }));

  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 760 }}>
        <AdminPanel topics={withOptions} suggestions={suggestions ?? []} />
      </main>
    </>
  );
}
