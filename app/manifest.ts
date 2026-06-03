import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Bizce sizce',
    short_name: 'Bizcesizce',
    description: 'Kuzey Kıbrıs için sivil anket platformu — oyla, anında sonuçları gör.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d0d0f',
    theme_color: '#0d0d0f',
    lang: 'tr',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
  };
}
