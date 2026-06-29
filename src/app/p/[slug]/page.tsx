import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { publicSupabase } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';
import {
  getPublishedPromptBySlug,
  getAllPublishedPrompts,
  getPublishedPromptAudience,
} from '@/lib/supabase/prompts';
import { getCopyCount } from '@/lib/prompt-stats';
import { resolveLocale, t } from '@/lib/i18n';
import PromptView from '@/components/prompts/prompt-view';
import ExclusiveGate from '@/components/prompts/exclusive-gate';

export const revalidate = 60;

export async function generateStaticParams() {
  // Anon client only sees public prompts under RLS, so exclusive prompts
  // are never statically pre-rendered (or leaked into the sitemap).
  const prompts = await getAllPublishedPrompts(publicSupabase);
  return prompts.map((p) => ({ slug: p.slug }));
}

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const prompt = await getPublishedPromptBySlug(publicSupabase, params.slug);
  const locale = resolveLocale(headers().get('accept-language'));
  const strings = t(locale);

  if (!prompt) {
    // Don't leak exclusive titles/descriptions; just signal it exists.
    const audience = await getPublishedPromptAudience(
      publicSupabase,
      params.slug
    );
    if (audience === 'mentees') {
      return {
        title: `${strings.gateTitle} ${strings.pageTitleSuffix}`,
        robots: { index: false, follow: false },
      };
    }
    return { title: strings.notFoundTitle };
  }

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
  const locale = resolveLocale(headers().get('accept-language'));

  // Fast path: public prompts are anon-readable and stay cacheable (no
  // cookies read, so this render can be served from the ISR cache).
  const publicPrompt = await getPublishedPromptBySlug(
    publicSupabase,
    params.slug
  );
  if (publicPrompt) {
    const initialCount = await getCopyCount(publicPrompt.slug);
    return (
      <PromptView
        prompt={publicPrompt}
        initialCount={initialCount}
        t={t(locale)}
      />
    );
  }

  // Not public: either it doesn't exist, or it's exclusive. Distinguish
  // the two via a security-definer lookup so we can 404 vs. gate.
  const audience = await getPublishedPromptAudience(publicSupabase, params.slug);
  if (!audience) notFound();

  // Exclusive: read with the viewer's session — RLS hands the prompt to
  // allowlisted mentees and admins, and nobody else. This reads cookies,
  // so this render is dynamic (never cached/shared across users).
  const supabase = createClient();
  const prompt = await getPublishedPromptBySlug(supabase, params.slug);
  if (!prompt) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return (
      <ExclusiveGate slug={params.slug} isLoggedIn={!!user} t={t(locale)} />
    );
  }

  const initialCount = await getCopyCount(prompt.slug);
  return (
    <PromptView prompt={prompt} initialCount={initialCount} t={t(locale)} />
  );
}
