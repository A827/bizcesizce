import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export const metadata = { title: 'Koşullar' };

export default function TermsPage() {
  const h2 = { fontSize: 20, marginTop: 28 } as const;
  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 640 }}>
        <h1 className="serif" style={{ fontSize: 30 }}>Koşullar · Terms</h1>
        <p className="mono muted" style={{ fontSize: 12 }}>Son güncelleme · Last updated: 2026-06</p>

        <h2 className="serif" style={h2}>Türkçe</h2>
        <p className="muted">
          Bizce sizce&apos;yi kullanarak gerçek bir kişi olduğunu ve her konuda yalnızca bir kez oy
          kullanacağını kabul edersin. Otomatik, sahte veya hileli oylama ve birden fazla hesap açmak
          yasaktır; bu tür hesaplar kapatılabilir. Kayıt sırasında verdiğin bilgilerin (ad, doğum
          tarihi, bölge vb.) doğru olduğunu kabul edersin. Hesabını ve tüm verilerini istediğin an
          profil sayfandan kalıcı olarak silebilirsin. Yorumlar ve önerdiğin konular yayınlanmadan
          önce denetlenebilir; uygunsuz, hakaret içeren veya yanıltıcı içerik kaldırılabilir.
          Platform bilgilendirme ve kamuoyu ölçümü amaçlıdır; sonuçlar katılımcı görüşlerinin bir
          yansımasıdır, bilimsel bir anket değildir. Kişisel verilerinin nasıl işlendiğini Gizlilik
          sayfasında bulabilirsin.
        </p>

        <h2 className="serif" style={h2}>English</h2>
        <p className="muted">
          By using Bizce sizce you confirm you are a real person and will vote only once per topic.
          Automated, fake or fraudulent voting and creating multiple accounts are prohibited and may
          result in your account being suspended. You agree that the details you provide at signup
          (name, date of birth, region, etc.) are accurate. You can permanently delete your account
          and all your data at any time from your profile page. Comments and topics you suggest may
          be reviewed before publication, and unsuitable, abusive or misleading content may be
          removed. The platform is for information and gauging public opinion; results reflect
          participants&apos; views and are not a scientific poll. See the Privacy page for how your
          personal data is handled.
        </p>
        <Footer />
      </main>
    </>
  );
}
