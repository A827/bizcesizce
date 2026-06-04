import Link from 'next/link';
import { Topic } from '@/lib/types';

// Logged-out, fully indexable landing page. Real content (the live polls)
// is rendered server-side so search engines and shared links see it.
export function PublicLanding({ topics, counts }: { topics: Topic[]; counts: Record<string, number> }) {
  return (
    <>
      <section style={{ textAlign: 'center', padding: '32px 0 8px' }}>
        <h1 className="serif" style={{ fontSize: 'clamp(30px, 8vw, 46px)', lineHeight: 1.1, margin: '0 0 12px' }}>
          Kuzey Kıbrıs<br /><span style={{ color: 'var(--accent)' }}>ne düşünüyor?</span>
        </h1>
        <p className="muted" style={{ maxWidth: 460, margin: '0 auto 20px', fontSize: 16 }}>
          Bizce sizce — gerçek insanların, herkese bir oy hakkıyla katıldığı sivil anket platformu.
          Oyla, anında sonuçları gör, paylaş.
        </p>
        <Link href="/login" className="btn btn-accent" style={{ display: 'inline-block' }}>
          Oy vermeye başla →
        </Link>
      </section>

      <div className="kicker" style={{ marginTop: 28 }}>Güncel anketler · Live polls</div>
      {topics.length === 0 ? (
        <p className="muted">Şu an aktif anket yok. · No active polls right now.</p>
      ) : (
        topics.map((t) => (
          <Link key={t.id} href={`/anket/${t.id}`} className="card"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            {t.is_daily && <div className="kicker">Günün sorusu</div>}
            <h2 className="question" style={{ margin: '0 0 8px' }}>{t.question_tr}</h2>
            <div className="total" style={{ marginTop: 0 }}>
              {(counts[t.id] ?? 0)} oy · sonuçları gör →
            </div>
          </Link>
        ))
      )}
    </>
  );
}
