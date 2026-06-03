// SERVER-ONLY Supabase client using the service-role key. Never import
// this into client components. Used for privileged actions like setting a
// comment's moderation status after the AI moderator decides.
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}
