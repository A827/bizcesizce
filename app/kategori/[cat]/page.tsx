import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CATEGORIES, CATEGORY_LABELS_TR, Category } from '@/lib/constants';
import { Topic } from '@/lib/types';

export const dynamic = 'force-dynamic';

function resolve(catParam: string): Category | null {
  return CATEGORIES.find((c) => c.toLowerCase() === catParam.toLowerCase()) ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const { cat } = await params;
  const c = resolve(cat);
  if (!c) return { title: 'Kategori' };
  const label = CATEGORY_LABELS_TR[c];
  return {
    title: `${label} anketleri`,
    description: `Kuzey Kıbrıs'ta ${label.toLowerCase()} konulu anketler ve sonuçları. ${c} polls for North Cyprus.`,
    alternates: { canonical: `/kategori/${c.toLowerCase()}` },
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ cat: string }> }) {
  const { cat } = await params;
  const c = resolve(cat);
  if (!c) notFound();
  const label = CATEGORY_LABELS_TR[c];

  const supabase = await createClient();
  const { data } = await supabase.from('topics')
    .select('*').eq('is_active', true).eq('category', c)
    .order('created_at', { ascending: false });
  const topics = (data ?? []) as Topic[];

  const jsonLd = [
    {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Anasayfa', item: 'https://bizcesizce.com/' },
        { '@type': 'ListItem', position: 2, name: label, item: `https://bizcesizce.com/kategori/${c.toLowerCase()}` },
      ],
    },
    {
      '@context': 'https://schema.org', '@type': 'ItemList',
      itemListElement: topics.map((t, i) => ({
        '@type': 'ListItem', position: i + 1, name: t.question_tr,
        url: `https://bizcesizce.com/anket/${t.id}`,
      })),
    },
  ];

  return (
    <>
      <Header />
      <main className="shell">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <p className="mono muted" style={{ fontSize: 12, marginTop: 12 }}>
          <Link href="/">Anasayfa</Link> · {label}
        </p>
        <h1 className="serif" style={{ fontSize: 28, margin: '4px 0 16px' }}>{label} anketleri</h1>

        {topics.length === 0 ? (
          <p className="muted">Bu kategoride aktif anket yok. · No active polls in this category.</p>
        ) : (
          topics.map((t) => (
            <Link key={t.id} href={`/anket/${t.id}`} className="card"
              style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
              <h2 className="question" style={{ margin: 0 }}>{t.question_tr}</h2>
            </Link>
          ))
        )}

        <p style={{ marginTop: 24 }}><Link href="/">← Tüm anketler</Link></p>
        <Footer />
      </main>
    </>
  );
}
