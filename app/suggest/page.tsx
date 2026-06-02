import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { SuggestForm } from './SuggestForm';

export default async function SuggestPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 520 }}>
        <SuggestForm />
      </main>
    </>
  );
}
