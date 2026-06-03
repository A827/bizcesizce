'use client';
import { useState } from 'react';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const { t, lang, setLang } = useLang();
  const [email, setEmail] = useState('');
  const [emailState, setEmailState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function signInGoogle() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function signInEmail() {
    if (!email.trim() || emailState === 'sending') return;
    setEmailState('sending');
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setEmailState(error ? 'error' : 'sent');
  }

  return (
    <main className="shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <button className="btn btn-ghost" style={{ position: 'fixed', top: 16, right: 16, padding: '8px 14px', minHeight: 0 }}
        onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}>
        <span className="mono">{lang === 'tr' ? 'EN' : 'TR'}</span>
      </button>

      <div className="logo serif" style={{ fontSize: 44 }}>Bizce<b>sizce</b></div>
      <p className="muted" style={{ maxWidth: 340, marginTop: 10, lineHeight: 1.5 }}>{t('loginBlurb')}</p>

      <div style={{ width: '100%', maxWidth: 340, marginTop: 30 }}>
        <button className="btn btn-accent btn-block" onClick={signInGoogle}>
          {t('continueGoogle')}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          <span className="mono muted" style={{ fontSize: 12 }}>{t('orDivider')}</span>
          <span style={{ flex: 1, height: 1, background: 'var(--border)' }} />
        </div>

        {emailState === 'sent' ? (
          <p style={{ color: 'var(--accent)', fontSize: 14 }}>{t('emailSent')}</p>
        ) : (
          <>
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              onKeyDown={(e) => { if (e.key === 'Enter') signInEmail(); }}
              style={{ width: '100%', padding: 14, borderRadius: 999, textAlign: 'center',
                background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)',
                font: 'inherit', marginBottom: 10 }}
            />
            <button className="btn btn-block" disabled={!email.trim() || emailState === 'sending'} onClick={signInEmail}>
              {emailState === 'sending' ? t('loading') : t('emailSend')}
            </button>
            {emailState === 'error' && <p className="error" style={{ fontSize: 13, marginTop: 8 }}>{t('errorGeneric')}</p>}
          </>
        )}
      </div>
    </main>
  );
}
