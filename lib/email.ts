// Transactional email via Resend. No-ops gracefully if RESEND_API_KEY is not
// set, so the rest of the app keeps working until email is configured.
const FROM = process.env.EMAIL_FROM || 'Bizce sizce <bildirim@bizcesizce.com>';
const SITE = 'https://bizcesizce.com';

export async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !to) return false;
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
      body: JSON.stringify({ from: FROM, to, subject, html }),
    });
    return res.ok;
  } catch { return false; }
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Shared, lightweight HTML shell (dark, on-brand). unsubToken builds the
// one-click unsubscribe link required for good deliverability + etiquette.
function shell(bodyHtml: string, unsubToken?: string): string {
  const unsub = unsubToken
    ? `<p style="margin:24px 0 0;font-size:12px;color:#9a978f">
         Bu bildirimleri almak istemiyorsan
         <a href="${SITE}/unsubscribe?token=${unsubToken}" style="color:#9a978f">aboneliği iptal et</a>.
       </p>`
    : '';
  return `<div style="background:#0d0d0f;color:#f4f1e9;font-family:Arial,Helvetica,sans-serif;padding:32px">
    <div style="max-width:520px;margin:0 auto">
      <div style="font-size:22px;font-weight:700;margin-bottom:20px">Bizce<span style="color:#e8c547">sizce</span></div>
      ${bodyHtml}
      ${unsub}
    </div>
  </div>`;
}

export function dailyDigestEmail(questionTr: string, topicId: string, unsubToken: string) {
  const url = `${SITE}/anket/${topicId}`;
  const subject = `Bugünün sorusu: ${questionTr}`;
  const html = shell(`
    <div style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:#e8c547;margin-bottom:8px">Günün sorusu</div>
    <div style="font-size:20px;line-height:1.3;margin-bottom:20px">${esc(questionTr)}</div>
    <a href="${url}" style="display:inline-block;background:#e8c547;color:#1a1500;text-decoration:none;
       font-weight:600;padding:12px 22px;border-radius:999px">Oyla ve sonuçları gör →</a>
  `, unsubToken);
  return { subject, html };
}

export function replyNotifyEmail(topicId: string, unsubToken: string) {
  const url = `${SITE}/anket/${topicId}`;
  const subject = 'Yorumuna yanıt geldi · Bizce sizce';
  const html = shell(`
    <div style="font-size:18px;line-height:1.4;margin-bottom:20px">Birisi yorumuna yanıt verdi.</div>
    <a href="${url}" style="display:inline-block;background:#e8c547;color:#1a1500;text-decoration:none;
       font-weight:600;padding:12px 22px;border-radius:999px">Yanıtı gör →</a>
  `, unsubToken);
  return { subject, html };
}
