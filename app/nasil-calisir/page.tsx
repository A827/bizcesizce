import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = {
  title: 'Nasıl çalışır',
  description: 'Bizce sizce nasıl çalışır: herkese bir oy, anonim sonuçlar, güvenilir istatistikler. How Bizce sizce works.',
  alternates: { canonical: '/nasil-calisir' },
};

export default function HowItWorksPage() {
  const h2 = { fontSize: 20, marginTop: 28, marginBottom: 6 } as const;
  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 640 }}>
        <h1 className="serif" style={{ fontSize: 30 }}>Nasıl çalışır · How it works</h1>

        <h2 className="serif" style={h2}>Herkese bir oy</h2>
        <p className="muted">
          Her kayıtlı kişi her konuda yalnızca bir kez oy kullanır. Bu kural veritabanı düzeyinde
          uygulanır — ekranda gizlenmez, teknik olarak engellenir. Sahte hesapları zorlaştırmak için
          robot kontrolü kullanırız.
        </p>

        <h2 className="serif" style={h2}>Sonuçlar anonimdir</h2>
        <p className="muted">
          Sonuçlar yalnızca toplu sayılar olarak gösterilir. Hiç kimsenin tek tek oyu, kimliği veya
          iletişim bilgisi herkese açık gösterilmez. Bölge ve yaş gibi bilgiler yalnızca sonuçları
          gruplamak içindir.
        </p>

        <h2 className="serif" style={h2}>Küçük örnekler yanıltmaz</h2>
        <p className="muted">
          Bir bölgenin veya grubun dağılımı, yeterli sayıda oy toplanana kadar gösterilmez. Böylece
          birkaç oydan yanlış bir sonuç çıkarılmaz ve kimsenin oyu tahmin edilemez.
        </p>

        <h2 className="serif" style={h2}>In short (English)</h2>
        <p className="muted">
          One vote per person per topic, enforced by the database, not just the screen. Results are
          always shown as anonymous aggregates — never individual votes or identities. Group
          breakdowns only appear once there are enough votes, so small samples can&apos;t mislead.
          It&apos;s a clear, honest read of what real people think — not a scientific survey.
        </p>

        <div style={{ marginTop: 28 }}>
          <Link href="/login" className="btn btn-accent" style={{ display: 'inline-block' }}>
            Oy vermeye başla →
          </Link>
        </div>
        <Footer />
      </main>
    </>
  );
}
