import { createAdminClient } from '@/lib/supabase/admin';

// Activate any scheduled topics whose publish time has arrived. Best-effort,
// safe to call often (indexed, fixed WHERE, no user input). Called on home
// load (near-real-time) and from the daily crons (backstop).
export async function publishDuePosts(): Promise<void> {
  try {
    const db = createAdminClient();
    await db.from('topics')
      .update({ is_active: true })
      .eq('is_active', false)
      .not('publish_at', 'is', null)
      .lte('publish_at', new Date().toISOString());
  } catch { /* best effort */ }
}
