import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { AdminPanel } from './AdminPanel';
import { Topic } from '@/lib/types';

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

  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 760 }}>
        <AdminPanel topics={(topics ?? []) as Topic[]} suggestions={suggestions ?? []} />
      </main>
    </>
  );
}
