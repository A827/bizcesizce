import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Plain-language privacy policy. Bilingual on one page.
export default function PrivacyPage() {
  const h2 = { fontSize: 20, marginTop: 28 } as const;
  const h3 = { fontSize: 16, marginTop: 18, marginBottom: 4 } as const;
  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 640 }}>
        <h1 className="serif" style={{ fontSize: 30 }}>Gizlilik · Privacy</h1>
        <p className="mono muted" style={{ fontSize: 12 }}>Son güncelleme · Last updated: 2026-06</p>

        {/* ---------------- TURKISH ---------------- */}
        <h2 className="serif" style={h2}>Türkçe</h2>

        <h3 className="serif" style={h3}>Hangi bilgileri topluyoruz</h3>
        <p className="muted">
          Hesap: Google veya e-posta ile giriş yaptığında e-posta adresin. Profil: ad, soyad, doğum
          tarihi, yaşadığın bölge, cinsiyet, medeni durum, iş, eğitim, köken ve (verirsen) telefon
          numaran. Katılımın: verdiğin oylar ve yazdığın yorumlar. Ayrıca sayfaların ne kadar hızlı
          açıldığını ve kaç ziyaret olduğunu ölçen toplu, kişisel olmayan istatistikler.
        </p>

        <h3 className="serif" style={h3}>Neden topluyoruz</h3>
        <p className="muted">
          Bölge ve yaş gibi bilgiler sonuçları gruplara göre gösterebilmek içindir. Telefon ve isim
          gibi bilgiler hesabını yönetmek ve topluluğu sağlıklı tutmak içindir. Robotları engellemek
          için Cloudflare Turnstile kullanırız.
        </p>

        <h3 className="serif" style={h3}>Herkese ne görünür</h3>
        <p className="muted">
          Yalnızca toplu istatistikler ve yorum yazarsan adın görünür. Soyadın, doğum tarihin,
          telefonun ve tek tek oyların asla herkese açık gösterilmez. Sonuçlar kimliğinle
          ilişkilendirilmez.
        </p>

        <h3 className="serif" style={h3}>Nerede saklanır</h3>
        <p className="muted">
          Verilerin güvenli bir veritabanında (Supabase) saklanır. Sen silene kadar tutulur.
        </p>

        <h3 className="serif" style={h3}>Hakların</h3>
        <p className="muted">
          Profil sayfandan bilgilerini görebilir, düzenleyebilir ve hesabını tüm verilerinle birlikte
          istediğin an kalıcı olarak silebilirsin. Her konuda kişi başına yalnızca bir oy hakkı
          vardır ve bu kural veritabanı düzeyinde uygulanır. Oylar nihaidir.
        </p>

        {/* ---------------- ENGLISH ---------------- */}
        <h2 className="serif" style={h2}>English</h2>

        <h3 className="serif" style={h3}>What we collect</h3>
        <p className="muted">
          Account: your email address when you sign in with Google or email. Profile: first name,
          last name, date of birth, region, sex, marital status, job, education, origin and (if you
          provide it) your phone number. Your activity: the votes you cast and comments you write.
          Plus aggregate, non-personal statistics about page speed and visit counts.
        </p>

        <h3 className="serif" style={h3}>Why we collect it</h3>
        <p className="muted">
          Details like region and age are used to group results. Details like name and phone are used
          to manage your account and keep the community healthy. We use Cloudflare Turnstile to block
          bots.
        </p>

        <h3 className="serif" style={h3}>What is public</h3>
        <p className="muted">
          Only aggregate statistics, plus your first name if you comment. Your last name, date of
          birth, phone and individual votes are never shown publicly, and results are never tied to
          your identity.
        </p>

        <h3 className="serif" style={h3}>Where it is stored</h3>
        <p className="muted">Your data is stored in a secure database (Supabase) and kept until you delete it.</p>

        <h3 className="serif" style={h3}>Your rights</h3>
        <p className="muted">
          You can view and edit your information on your profile page, and permanently delete your
          account along with all your data at any time. Each person may cast only one vote per
          topic — enforced at the database level. Votes are final.
        </p>

        <Footer />
      </main>
    </>
  );
}
