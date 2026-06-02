import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SetupForm } from './SetupForm';

// Server-protected: must be signed in. If profile already complete, skip.
export default async function SetupPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles').select('region, age_band').eq('user_id', user.id).single();
  if (profile?.region && profile?.age_band) redirect('/');

  return <SetupForm />;
}
