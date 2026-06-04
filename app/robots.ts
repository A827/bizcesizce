import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/profile', '/setup', '/api/', '/auth/'],
    },
    sitemap: 'https://bizcesizce.com/sitemap.xml',
    host: 'https://bizcesizce.com',
  };
}
