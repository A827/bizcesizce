import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getResults, getOptionResults } from '@/lib/actions';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Comment, Topic } from '@/lib/types';
import { CATEGORY_LABELS_TR, Category } from '@/lib/constants';

export const dynamic = 'force-dynamic';

async function loadTopic(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from('topics')
    .select('*').eq('id', id).eq('is_active', true).single();
  return (data as Topic | null) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const topic = await loadTopic(id);
  if (!topic) return { title: 'Anket bulunamadı' };
  const title = topic.question_tr;
  const description = `${topic.question_tr} — Kuzey Kıbrıs ne düşünüyor? Sonuçları gör ve oyla. ${topic.question_en ?? ''}`.trim();
  const ogImage = `/api/share?topic=${id}`;
  return {
    title,
    description,
    alternates: { canonical: `/anket/${id}` },
    openGraph: { title, description, url: `/anket/${id}`, type: 'article',
      images: [{ url: ogImage, width: 1080, height: 1080 }] },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
  };
}

function Bar({ label, pct, total, color }: { label: string; pct: number; total: number; color: string }) {
  return (
    <div className="bar-wrap">
      <div className="bar-label"><span>{label}</span><span className="bar-pct">{pct}%</span></div>
      <div className="bar" style={{ background: 'var(--surface-2)' }}>
        <span style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default async function PublicPollPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const topic = await loadTopic(id);
  if (!topic) notFound();

  const supabase = await createClient();
  const { data: comments } = await supabase.from('comments')
    .select('id, topic_id, body, status, region, author_name, created_at')
    .eq('topic_id', id).eq('status', 'approved')
    .order('created_at', { ascending: false }).limit(20);
  const approved = (comments ?? []) as Comment[];

  const isMulti = topic.poll_type === 'multi';
  let total = 0;
  let bars: { label: string; pct: number; color: string }[] = [];

  if (isMulti) {
    const opts = await getOptionResults(id);
    total = opts.reduce((s, o) => s + o.votes, 0);
    const palette = ['#e8c547', '#6f6cff', '#ff5d52', '#4ec9b0', '#c97bff'];
    bars = opts.map((o, i) => ({
      label: o.label_tr,
      pct: total ? Math.round((o.votes / total) * 100) : 0,
      color: palette[i % palette.length],
    }));
  } else {
    const r = await getResults(id);
    total = r.total_agree + r.total_disagree;
    const agreePct = total ? Math.round((r.total_agree / total) * 100) : 0;
    bars = [
      { label: 'Katılıyorum', pct: agreePct, color: 'var(--agree)' },
      { label: 'Katılmıyorum', pct: 100 - agreePct, color: 'var(--disagree)' },
    ];
  }

  // JSON-LD for the question (helps rich results).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Question',
    name: topic.question_tr,
    text: topic.question_tr,
    answerCount: total,
    dateCreated: topic.created_at,
  };

  return (
    <>
      <Header />
      <main className="shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <article className="card daily" style={{ marginTop: 16 }}>
          <div className="kicker">
            Bizce sizce · <Link href={`/kategori/${(topic.category as Category).toLowerCase()}`} style={{ color: 'var(--accent)' }}>
              {CATEGORY_LABELS_TR[topic.category as Category] ?? 'Anket'}
            </Link>
          </div>
          <h1 className="question">{topic.question_tr}</h1>
          {topic.question_en && (
            <p className="muted" style={{ marginTop: -8, marginBottom: 16, fontStyle: 'italic' }}>{topic.question_en}</p>
          )}

          {total > 0 ? (
            <>
              {bars.map((b, i) => <Bar key={i} label={b.label} pct={b.pct} total={total} color={b.color} />)}
              <div className="total">{total} toplam oy · {total} total votes</div>
            </>
          ) : (
            <p className="muted">Henüz oy yok. İlk oyu sen ver. · No votes yet — be the first.</p>
          )}

          <Link href="/login" className="btn btn-accent btn-block" style={{ marginTop: 18 }}>
            Sen ne diyorsun? Oy ver →
          </Link>
        </article>

        {approved.length > 0 && (
          <section style={{ marginTop: 8 }}>
            <div className="kicker">Yorumlar · Comments</div>
            {approved.map((c) => (
              <div key={c.id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ fontSize: 14 }}>{c.body}</div>
                <div className="mono" style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>
                  {c.author_name && <strong style={{ color: 'var(--text)' }}>{c.author_name} · </strong>}
                  {c.region ?? '—'}
                </div>
              </div>
            ))}
          </section>
        )}

        <p style={{ marginTop: 24 }}>
          <Link href="/">← Tüm anketler · All polls</Link>
        </p>
        <Footer />
      </main>
    </>
  );
}
