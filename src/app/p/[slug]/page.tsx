import { notFound } from 'next/navigation';
import { getAllPromptSlugs, getPromptBySlug } from '@/lib/prompts';
import { getCopyCount } from '@/lib/prompt-stats';
import PromptView from '@/components/prompts/prompt-view';

export async function generateStaticParams() {
  return getAllPromptSlugs().map((slug) => ({ slug }));
}

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const prompt = getPromptBySlug(params.slug);
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
  const prompt = getPromptBySlug(params.slug);
  if (!prompt) notFound();

  const initialCount = await getCopyCount(prompt.slug);

  return <PromptView prompt={prompt} initialCount={initialCount} />;
}
