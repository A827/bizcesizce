// AI comment moderation. Returns 'approve' or 'reject' for a comment body.
// Uses Anthropic's Claude Haiku. If no API key is configured, we fail SAFE
// by leaving the comment pending (returns 'pending') so a human reviews it.
export type Decision = 'approve' | 'reject' | 'pending';

const SYSTEM = `You moderate comments on a civic polling site for North Cyprus (Turkish/English).
Approve normal opinions, disagreement, and criticism of ideas/policies.
Reject only: hate speech, slurs, harassment of a person, threats, sexual content,
spam/advertising, or doxxing. Political opinions and strong civic disagreement are ALLOWED.
Reply with ONLY one word: approve or reject.`;

export async function moderateText(body: string): Promise<Decision> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return 'pending'; // not configured yet → human review

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 5,
        system: SYSTEM,
        messages: [{ role: 'user', content: body.slice(0, 1000) }],
      }),
    });
    if (!res.ok) return 'pending';
    const data = await res.json();
    const text = (data?.content?.[0]?.text ?? '').toLowerCase();
    if (text.includes('reject')) return 'reject';
    if (text.includes('approve')) return 'approve';
    return 'pending';
  } catch {
    return 'pending';
  }
}
