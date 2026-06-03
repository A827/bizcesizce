import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: 'Bizce sizce',
  description: 'Kuzey Kıbrıs için sivil anket platformu — Civic polling for North Cyprus.',
  metadataBase: new URL('https://bizcesizce.com'),
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

export const viewport = { themeColor: '#0d0d0f', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* Fonts: Fraunces (display), Spline Sans (UI), Spline Sans Mono (labels) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Spline+Sans:wght@400;500;600&family=Spline+Sans+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
