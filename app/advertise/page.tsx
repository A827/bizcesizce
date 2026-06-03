'use client';
import { useLang } from '@/components/LanguageProvider';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

export default function AdvertisePage() {
  const { lang } = useLang();
  const tr = lang === 'tr';
  return (
    <>
      <Header />
      <main className="shell" style={{ maxWidth: 640 }}>
        <h1 className="serif" style={{ fontSize: 30 }}>{tr ? 'Reklam ver' : 'Advertise with us'}</h1>
        <p className="muted" style={{ marginTop: 8 }}>
          {tr
            ? 'Bizce sizce, Kuzey Kıbrıs’ta güvenilir ve ilgili bir kitleye ulaşır. Reklamlarımız sade, açıkça “Sponsorlu” etiketli ve takip kodu içermez — okuyucularımızın güvenini koruruz.'
            : 'Bizce sizce reaches an engaged, trusting audience across North Cyprus. Our ads are clean, clearly labelled “Sponsored”, and tracker-free — we protect our readers’ trust.'}
        </p>

        <h2 className="serif" style={{ fontSize: 20, marginTop: 24 }}>{tr ? 'Seçenekler' : 'Options'}</h2>
        <p className="muted">
          {tr
            ? 'Sonuç ekranı altı sponsor alanı, akış içi sponsor kartı, ve altbilgi sponsorluğu. Ayrıca markanıza özel “sponsorlu soru” ve anonim, toplu trend raporları sunabiliriz.'
            : 'A sponsor slot below the result reveal, an in-feed sponsor card, and footer sponsorship. We also offer branded “sponsored questions” and anonymised, aggregate trend reports.'}
        </p>

        <h2 className="serif" style={{ fontSize: 20, marginTop: 24 }}>{tr ? 'Kabul etmediklerimiz' : 'What we don’t run'}</h2>
        <p className="muted">
          {tr
            ? 'Tarafsızlığımızı korumak için siyasi/parti reklamları ve takip eden programatik reklam ağları yayınlamıyoruz.'
            : 'To stay neutral, we don’t run political/party ads or tracking-based programmatic ad networks.'}
        </p>

        <a className="btn btn-accent btn-block" style={{ marginTop: 28 }}
          href="mailto:coskuntunckaya@gmail.com?subject=Bizce%20sizce%20-%20Reklam">
          {tr ? 'İletişime geç' : 'Get in touch'}
        </a>
        <Footer />
      </main>
    </>
  );
}
