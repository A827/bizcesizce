'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';

type Mode = 'signin' | 'signup';

export default function LoginPage() {
  const { t, lang, setLang } = useLang();
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ kind: 'error' | 'ok'; text: string } | null>(null);
  const [magicState, setMagicState] = useState<'idle' | 'sending' | 'sent'>('idle');

  async function signInGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function submitPassword() {
    if (busy) return;
    setMsg(null);
    if (!email.trim()) return;
    if (password.length < 6) { setMsg({ kind: 'error', text: t('pwTooShort') }); return; }
    setBusy(true);
    const supabase = createClient();

    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(), password,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      });
      setBusy(false);
      if (error) { setMsg({ kind: 'error', text: error.message }); return; }
      // If confirmation is required, there is no session yet.
      if (!data.session) { setMsg({ kind: 'ok', text: t('confirmEmailSent') }); return; }
      router.push('/'); router.refresh();
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (error) {
      const m = error.message.toLowerCase();
      if (m.includes('not confirmed')) setMsg({ kind: 'error', text: t('emailNotConfirmed') });
      else setMsg({ kind: 'error', text: t('wrongCreds') });
      return;
    }
    router.push('/'); router.refresh();
  }

  async function forgotPassword() {
    if (!email.trim()) { setMsg({ kind: 'error', text: t('emailPlaceholder') }); return; }
    setBusy(true); setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/sifre-yenile`,
    });
    setBusy(false);
    setMsg(error ? { kind: 'error', text: t('errorGeneric') } : { kind: 'ok', text: t('resetSent') });
  }

  async function sendMagicLink() {
    if (!email.trim() || magicState === 'sending') return;
    setMagicState('sending'); setMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) { setMagicState('idle'); setMsg({ kind: 'error', text: t('errorGeneric') }); }
    else setMagicState('sent');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: 14, borderRadius: 999, textAlign: 'center',
    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
    font: 'inherit', marginBottom: 10,
  };
  const segBtn = (m: Mode): React.CSSProperties => ({
    flex: 1, padding: '10px 0', borderRadius: 999, cursor: 'pointer', font: 'inherit',
    border: '1px solid ' + (mode === m ? 'var(--accent)' : 'var(--border)'),
    background: mode === m ? 'var(--accent)' : 'transparent',
    color: mode === m ? 'var(--accent-ink)' : 'var(--text)', fontWeight: mode === m ? 600 : 400,
  });

  return (
    <main className="shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <button className="btn btn-ghost" style={{ position: 'fixed', top: 16, right: 16, padding: '8px 14px', minHeight: 0 }}
        onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}>
        <span className="mono">{lang === 'tr' ? 'EN' : 'TR'}</span>
      </button>

      <div className="logo serif" style={{ fontSize: 44 }}>Bizce<b>sizce</b></div>
      <p className="muted" style={{ maxWidth: 340, marginTop: 10, lineHeight: 1.5 }}>{t('loginBlurb')}</p>

      <div style={{ width: '100%', maxWidth: 340, marginTop: 26 }}>
        <button className="btn btn-accent btn-block" onClick={signInGoogle}>{t('continueGoogle')}</button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '18px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="mono muted" style={{ fontSize: 12 }}>{t('orDivider')}</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {/* Log in / Sign up toggle */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
          <button style={segBtn('signin')} onClick={() => { setMode('signin'); setMsg(null); }}>{t('tabSignIn')}</button>
          <button style={segBtn('signup')} onClick={() => { setMode('signup'); setMsg(null); }}>{t('tabSignUp')}</button>
        </div>

        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')} style={inputStyle} autoComplete="email" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')} style={inputStyle}
          autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
          onKeyDown={(e) => { if (e.key === 'Enter') submitPassword(); }} />

        <button className="btn btn-accent btn-block" disabled={!email.trim() || busy} onClick={submitPassword}>
          {busy ? t('loading') : mode === 'signup' ? t('pwSignup') : t('pwLogin')}
        </button>

        {mode === 'signin' && (
          <button className="btn btn-ghost" style={{ fontSize: 12, padding: '6px 10px', minHeight: 0, marginTop: 6 }}
            disabled={busy} onClick={forgotPassword}>{t('forgotPw')}</button>
        )}

        {msg && <p className={msg.kind === 'error' ? 'error' : ''}
          style={{ fontSize: 13, marginTop: 10, color: msg.kind === 'ok' ? 'var(--accent)' : undefined }}>{msg.text}</p>}

        {/* Passwordless option */}
        <div style={{ marginTop: 16 }}>
          {magicState === 'sent' ? (
            <p style={{ color: 'var(--accent)', fontSize: 13 }}>{t('emailSent')}</p>
          ) : (
            <button className="btn btn-ghost" style={{ fontSize: 13, padding: '6px 10px', minHeight: 0 }}
              disabled={!email.trim() || magicState === 'sending'} onClick={sendMagicLink}>
              {magicState === 'sending' ? t('loading') : t('magicInstead')}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
