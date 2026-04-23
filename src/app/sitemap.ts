import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { publicSupabase } from '@/lib/supabase/public';
import { getAllPublishedPrompts } from '@/lib/supabase/prompts';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const host = (headers().get('host') ?? '').toLowerCase();

  if (host.startsWith('prompts.')) {
    const base = 'https://prompts.blainercosta.com';
    const prompts = await getAllPublishedPrompts(publicSupabase);
    return [
      {
        url: base,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
      ...prompts.map((p) => ({
        url: `${base}/${p.slug}`,
        lastModified: new Date(p.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    ];
  }

  return [];
}
