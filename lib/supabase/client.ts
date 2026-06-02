// Supabase connection used in the browser (the visitor's phone/laptop).
// The two values below are PUBLIC and safe to ship — they only allow the
// limited actions our row-level-security rules permit. The secret service
// key is NEVER put here.
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
