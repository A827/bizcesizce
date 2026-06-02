'use client';
import { useLang } from '@/components/LanguageProvider';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const { t, lang, setLang } = useLang();

  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <main className="shell" style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
      <button className="btn btn-ghost" style={{ position: 'fixed', top: 16, right: 16, padding: '8px 14px', minHeight: 0 }}
        onClick={() => setLang(lang === 'tr' ? 'en' : 'tr')}>
        <span className="mono">{lang === 'tr' ? 'EN' : 'TR'}</span>
      </button>

      <div className="logo serif" style={{ fontSize: 40 }}>Bizce<b>sizce</b></div>
      <p className="muted" style={{ maxWidth: 320, marginTop: 8 }}>{t('tagline')}</p>

      <button className="btn btn-accent btn-block" style={{ maxWidth: 320, marginTop: 28 }} onClick={signIn}>
        {t('continueGoogle')}
      </button>
    </main>
  );
}
