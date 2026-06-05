// Cookie-FREE Supabase client for public, cacheable pages. Because it reads
// no cookies, Next.js can statically render + ISR-cache these pages instead
// of running them dynamically on every request. Only use for public data
// (active topics, aggregate results, approved comments).
import { createClient } from '@supabase/supabase-js';

export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
