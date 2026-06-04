import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';

const BASE = 'https://bizcesizce.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/nasil-calisir`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE}/archive`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/advertise`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  try {
    const supabase = await createClient();
    const { data } = await supabase.from('topics')
      .select('id, created_at').eq('is_active', true)
      .order('created_at', { ascending: false }).limit(2000);
    const polls: MetadataRoute.Sitemap = (data ?? []).map((t: { id: string; created_at: string }) => ({
      url: `${BASE}/anket/${t.id}`,
      lastModified: t.created_at,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }));
    return [...staticRoutes, ...polls];
  } catch {
    return staticRoutes;
  }
}
