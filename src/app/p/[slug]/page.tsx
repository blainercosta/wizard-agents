import { notFound } from 'next/navigation';
import { publicSupabase } from '@/lib/supabase/public';
import {
  getPublishedPromptBySlug,
  getAllPublishedPrompts,
} from '@/lib/supabase/prompts';
import { getCopyCount } from '@/lib/prompt-stats';
import PromptView from '@/components/prompts/prompt-view';

export const revalidate = 60;

export async function generateStaticParams() {
  const prompts = await getAllPublishedPrompts(publicSupabase);
  return prompts.map((p) => ({ slug: p.slug }));
}

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const prompt = await getPublishedPromptBySlug(publicSupabase, params.slug);
  if (!prompt) return { title: 'Prompt não encontrado' };

  const base = 'https://prompts.blainercosta.com';
  const url = `${base}/${prompt.slug}`;
  const ogImage = `${base}/p/${prompt.slug}/opengraph-image`;
  return {
    metadataBase: new URL(base),
    title: `${prompt.title} · prompts.blainercosta`,
    description: prompt.description,
    openGraph: {
      title: prompt.title,
      description: prompt.description,
      url,
      images: [ogImage],
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

  const initialCount = await getCopyCount(prompt.slug);

  return <PromptView prompt={prompt} initialCount={initialCount} />;
}
