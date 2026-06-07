import type { Metadata } from 'next';
import { Fraunces, Spline_Sans, Spline_Sans_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/components/LanguageProvider';
import { SetupGuard } from '@/components/SetupGuard';
import { SideRails } from '@/components/SideRails';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

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
  verification: { google: 'XfEshfx_SH9SV7fnQiY9Q7bjRjkRnf2MK9nvJl-M0gw' },
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
      <head>
        {/* Set the theme before first paint so there's no light/dark flash. */}
        <script
          dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark'){t=(window.matchMedia&&window.matchMedia('(prefers-color-scheme: light)').matches)?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){}})();` }}
        />
        {/* AdSense loader — in <head> as AdSense recommends, only when configured. */}
        {ADSENSE_CLIENT && (
          // eslint-disable-next-line @next/next/no-sync-scripts
          <script async crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`} />
        )}
      </head>
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
        <LanguageProvider>
          <SideRails />
          {children}
        </LanguageProvider>
        <SetupGuard />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
