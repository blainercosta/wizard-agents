import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { getAllPrompts } from '@/lib/prompts';

export default function sitemap(): MetadataRoute.Sitemap {
  const host = (headers().get('host') ?? '').toLowerCase();

  if (host.startsWith('prompts.')) {
    const base = 'https://prompts.blainercosta.com';
    return [
      {
        url: base,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 1,
      },
      ...getAllPrompts().map((p) => ({
        url: `${base}/${p.slug}`,
        lastModified: new Date(p.publishedAt),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      })),
    ];
  }

  // Wizards host — no sitemap entries wired yet; keep shape but empty.
  return [];
}
