import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { publicSupabase } from '@/lib/supabase/public';
import {
  getPublishedPromptBySlug,
  getAllPublishedPrompts,
} from '@/lib/supabase/prompts';
import { getCopyCount } from '@/lib/prompt-stats';
import { resolveLocale, t } from '@/lib/i18n';
import PromptView from '@/components/prompts/prompt-view';

export const revalidate = 60;

export async function generateStaticParams() {
  const prompts = await getAllPublishedPrompts(publicSupabase);
  return prompts.map((p) => ({ slug: p.slug }));
}

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const prompt = await getPublishedPromptBySlug(publicSupabase, params.slug);
  if (!prompt) return { title: 'Prompt not found' };

  const locale = resolveLocale(headers().get('accept-language'));
  const strings = t(locale);

  const base = 'https://prompts.blainercosta.com';
  const url = `${base}/${prompt.slug}`;
  const ogImage = `${base}/p/${prompt.slug}/opengraph-image`;
  return {
    metadataBase: new URL(base),
    title: `${prompt.title} ${strings.pageTitleSuffix}`,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
      url,
      images: [ogImage],
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: prompt.title,
      description: prompt.description,
      images: [ogImage],
    },
    alternates: { canonical: url },
  };
}

export default async function PromptPage({ params }: Params) {
  const prompt = await getPublishedPromptBySlug(publicSupabase, params.slug);
  if (!prompt) notFound();

  const locale = resolveLocale(headers().get('accept-language'));
  const initialCount = await getCopyCount(prompt.slug);

  return <PromptView prompt={prompt} initialCount={initialCount} t={t(locale)} />;
}
