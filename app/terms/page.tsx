import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 640 }}>
        <h1 className="serif" style={{ fontSize: 30 }}>Koşullar · Terms</h1>

        <h2 className="serif" style={{ fontSize: 20, marginTop: 24 }}>Türkçe</h2>
        <p className="muted">
          Bizce sizce&apos;yi kullanarak gerçek bir kişi olduğunuzu ve her konuda yalnızca bir kez
          oy kullanacağınızı kabul edersiniz. Otomatik veya hileli oylama yasaktır. Önerdiğiniz
          konular yayınlanmadan önce gözden geçirilir; uygunsuz içerik reddedilebilir. Platform
          bilgilendirme ve kamuoyu ölçümü amaçlıdır; sonuçlar bilimsel bir anket değil, katılımcı
          görüşlerinin bir yansımasıdır.
        </p>

        <h2 className="serif" style={{ fontSize: 20, marginTop: 24 }}>English</h2>
        <p className="muted">
          By using Bizce sizce you confirm you are a real person and will vote only once per topic.
          Automated or fraudulent voting is prohibited. Topics you suggest are reviewed before
          publication and unsuitable content may be rejected. The platform is for information and
          gauging public opinion; results reflect participants&apos; views and are not a scientific
          poll.
        </p>
        <Footer />
      </main>
    </>
  );
}
