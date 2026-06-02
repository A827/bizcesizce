// Google sends the user back here after sign-in. We exchange the code for
// a session, then send them on: to setup if their profile is incomplete,
// otherwise to home.
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('region, age_band').eq('user_id', user.id).single();
      if (!profile?.region || !profile?.age_band) {
        return NextResponse.redirect(`${origin}/setup`);
      }
    }
  }
  return NextResponse.redirect(`${origin}/`);
}
