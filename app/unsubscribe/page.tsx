import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export default async function UnsubscribePage({
  searchParams,
}: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  let ok = false;
  if (token) {
    try {
      const db = createAdminClient();
      const { data } = await db.from('profiles')
        .update({ notify_daily: false, notify_replies: false })
        .eq('unsubscribe_token', token)
        .select('user_id');
      ok = !!(data && data.length);
    } catch { /* show invalid */ }
  }

  return (
    <>
      <Header />
      <main className="shell" style={{ paddingTop: 24 }}>
        <h1 className="serif" style={{ fontSize: 26 }}>
          {ok ? 'Abonelik iptal edildi · Unsubscribed' : 'Bağlantı geçersiz · Invalid link'}
        </h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {ok
            ? 'Artık e-posta bildirimi almayacaksın. İstediğin zaman profil sayfandan tekrar açabilirsin. · You won’t receive email notifications anymore. You can re-enable them from your profile anytime.'
            : 'Bu bağlantı geçersiz veya süresi dolmuş. · This link is invalid or expired.'}
        </p>
        <p style={{ marginTop: 16 }}><a href="/">← Ana sayfa</a></p>
      </main>
      <Footer />
    </>
  );
}
