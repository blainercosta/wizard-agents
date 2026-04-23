import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

export default function robots(): MetadataRoute.Robots {
  const host = (headers().get('host') ?? '').toLowerCase();
  const base = host.startsWith('prompts.')
    ? 'https://prompts.blainercosta.com'
    : 'https://wizards.blainercosta.com';

  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/api/', '/admin'] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
