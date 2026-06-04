import type { Metadata } from 'next';
import { Fraunces, Spline_Sans, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import { SetupGuard } from '@/components/SetupGuard';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

// Self-hosted, preloaded fonts (no render-blocking external request).
// latin-ext covers Turkish glyphs (ç ğ ş ı İ ö ü). display:swap avoids
// invisible text while loading.
const fraunces = Fraunces({
  subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'],
  variable: '--font-fraunces', display: 'swap',
});
const spline = Spline_Sans({
  subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'],
  variable: '--font-spline', display: 'swap',
});
const splineMono = Spline_Sans_Mono({
  subsets: ['latin', 'latin-ext'], weight: ['400', '500', '600'],
  variable: '--font-spline-mono', display: 'swap',
});

export const metadata: Metadata = {
  title: { default: 'Bizce sizce — Kuzey Kıbrıs ne düşünüyor?', template: '%s · Bizce sizce' },
  description: 'Kuzey Kıbrıs için sivil anket platformu. Oyla, anında sonuçları gör, paylaş. Civic polling for North Cyprus.',
  metadataBase: new URL('https://bizcesizce.com'),
  alternates: { canonical: '/' },
  keywords: ['Kuzey Kıbrıs anket', 'KKTC anket', 'kamuoyu', 'oylama', 'North Cyprus poll', 'Bizce sizce'],
  openGraph: {
    title: 'Bizce sizce',
    description: 'Kuzey Kıbrıs ne düşünüyor? Oyla, anında sonuçları gör.',
    siteName: 'Bizce sizce', type: 'website', url: 'https://bizcesizce.com',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bizce sizce',
    description: 'Kuzey Kıbrıs ne düşünüyor? Oyla, anında sonuçları gör.',
    images: ['/api/og'],
  },
  appleWebApp: { capable: true, title: 'Bizce sizce', statusBarStyle: 'black-translucent' },
};

export const viewport = {
  themeColor: '#0d0d0f', width: 'device-width', initialScale: 1, viewportFit: 'cover' as const,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`${fraunces.variable} ${spline.variable} ${splineMono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Bizce sizce',
            url: 'https://bizcesizce.com',
            description: 'Kuzey Kıbrıs için sivil anket platformu.',
            inLanguage: ['tr', 'en'],
            publisher: { '@type': 'Organization', name: 'Bizce sizce', url: 'https://bizcesizce.com' },
          }) }}
        />
        <LanguageProvider>{children}</LanguageProvider>
        <SetupGuard />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
