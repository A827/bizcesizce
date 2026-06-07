// Best-effort notification helpers (never throw / never block the caller).
import { createAdminClient } from '@/lib/supabase/admin';
import { sendEmail, replyNotifyEmail } from '@/lib/email';

// Email the author of a parent comment when their comment gets an APPROVED
// reply. No-ops on self-replies, opted-out users, or missing email/key.
export async function notifyReply(replyCommentId: string) {
  try {
    const db = createAdminClient();
    const { data: reply } = await db.from('comments')
      .select('parent_id, topic_id, user_id, status').eq('id', replyCommentId).single();
    if (!reply?.parent_id || reply.status !== 'approved') return;

    const { data: parent } = await db.from('comments')
      .select('user_id').eq('id', reply.parent_id).single();
    if (!parent?.user_id || parent.user_id === reply.user_id) return;

    const { data: prof } = await db.from('profiles')
      .select('notify_replies, unsubscribe_token').eq('user_id', parent.user_id).single();
    if (!prof?.notify_replies) return;

    const { data: u } = await db.auth.admin.getUserById(parent.user_id);
    const email = u?.user?.email;
    if (!email) return;

    const { subject, html } = replyNotifyEmail(reply.topic_id, prof.unsubscribe_token as string);
    await sendEmail(email, subject, html);
  } catch { /* best effort */ }
}
