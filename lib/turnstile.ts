// Cloudflare Turnstile — server-side "are you human?" verification.
// Confirms the token the browser widget produced is real, so bots can't
// mass-create accounts. If no secret key is configured yet, we FAIL OPEN
// (treat as verified) so the site keeps working until the keys are added.
export async function verifyTurnstile(token: string | null): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // not configured yet → don't block real users
  if (!token) return false; // configured but no token → reject

  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return data?.success === true;
  } catch {
    return false;
  }
}
