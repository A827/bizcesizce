import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getMyProfile } from '@/lib/actions';
import { Header } from '@/components/Header';
import { ProfileView } from './ProfileView';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const profile = await getMyProfile();
  if (!profile?.region || !profile?.age_band) redirect('/setup');

  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 520 }}>
        <ProfileView profile={profile} email={user.email ?? ''} />
      </main>
    </>
  );
}
