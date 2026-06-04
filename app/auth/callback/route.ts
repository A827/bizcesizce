// Google sends the user back here after sign-in. We exchange the code for
// a session, then send them on: to setup if their profile is incomplete,
// otherwise to home.
import { NextResponse } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const supabase = await createClient();

  // Google / PKCE sign-in returns a ?code; email magic links may instead
  // return ?token_hash & type. Handle both so the session is set server-side.
  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (token_hash && type) {
    await supabase.auth.verifyOtp({ type, token_hash });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { data: profile } = await supabase
      .from('profiles').select('region, age_band').eq('user_id', user.id).single();
    if (!profile?.region || !profile?.age_band) {
      return NextResponse.redirect(`${origin}/setup`);
    }
  }
  return NextResponse.redirect(`${origin}/`);
}
