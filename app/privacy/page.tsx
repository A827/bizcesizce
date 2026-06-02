import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Plain-language privacy policy. Bilingual on one page.
export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 640 }}>
        <h1 className="serif" style={{ fontSize: 30 }}>Gizlilik · Privacy</h1>

        <h2 className="serif" style={{ fontSize: 20, marginTop: 24 }}>Türkçe</h2>
        <p className="muted">
          Bizce sizce yalnızca toplu istatistikleri gösterir. Hiç kimsenin kimliği, bölgesi veya
          tek tek oyu herkese açık olarak gösterilmez. Google ile giriş yaptığınızda yalnızca
          hesabınızı tanımak için gerekli bilgiyi alırız. Seçtiğiniz bölge ve yaş aralığı yalnızca
          sonuçları gruplamak için kullanılır ve sizinle ilişkilendirilmiş şekilde paylaşılmaz.
          Oylar nihaidir ve değiştirilemez. Her konuda kişi başına yalnızca bir oy hakkı vardır;
          bu kural veritabanı düzeyinde uygulanır.
        </p>

        <h2 className="serif" style={{ fontSize: 20, marginTop: 24 }}>English</h2>
        <p className="muted">
          Bizce sizce only ever shows aggregate statistics. No individual&apos;s identity, region, or
          vote is ever shown publicly. When you sign in with Google we only receive what is needed
          to recognise your account. Your chosen region and age range are used solely to group
          results and are never shared in a way that identifies you. Votes are final and cannot be
          changed. Each person may cast only one vote per topic — a rule enforced at the database
          level.
        </p>
        <Footer />
      </main>
    </>
  );
}
