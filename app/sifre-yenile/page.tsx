'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const { t } = useLang();
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [state, setState] = useState<'idle' | 'saving' | 'done' | 'error'>('idle');

  async function save() {
    if (pw.length < 6) { setState('error'); return; }
    setState('saving');
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: pw });
    if (error) { setState('error'); return; }
    setState('done');
    setTimeout(() => { router.push('/'); router.refresh(); }, 1500);
  }

  const input: React.CSSProperties = { width: '100%', padding: 14, borderRadius: 999, textAlign: 'center',
    background: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--text)', font: 'inherit', marginBottom: 10 };

  return (
    <main className="shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center', maxWidth: 380 }}>
      <div className="logo serif" style={{ fontSize: 36, marginBottom: 16 }}>Bizce<b>sizce</b></div>
      <h1 className="serif" style={{ fontSize: 22, marginBottom: 16 }}>{t('setNewPassword')}</h1>
      <input type="password" value={pw} onChange={(e) => setPw(e.target.value)}
        placeholder={t('newPassword')} style={input} autoComplete="new-password"
        onKeyDown={(e) => { if (e.key === 'Enter') save(); }} />
      <button className="btn btn-accent btn-block" disabled={state === 'saving' || !pw} onClick={save}>
        {state === 'saving' ? t('loading') : t('save')}
      </button>
      {state === 'done' && <p style={{ color: 'var(--accent)', fontSize: 14, marginTop: 12 }}>{t('pwUpdated')}</p>}
      {state === 'error' && <p className="error" style={{ fontSize: 13, marginTop: 12 }}>{t('pwTooShort')}</p>}
    </main>
  );
}
