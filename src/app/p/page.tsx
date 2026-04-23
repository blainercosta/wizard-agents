import { headers } from 'next/headers';
import SocialLinks from '@/components/prompts/social-links';
import { COMMUNITY_URL, MENTORIA_URL, resolveLocale, t } from '@/lib/i18n';

export async function generateMetadata() {
  const locale = resolveLocale(headers().get('accept-language'));
  const strings = t(locale);
  return {
    title: strings.landingTitle,
    description: strings.landingMetaDescription,
    openGraph: {
      title: strings.landingTitle,
      description: strings.landingMetaDescription,
      url: 'https://prompts.blainercosta.com',
      locale,
    },
    twitter: {
      card: 'summary_large_image',
      title: strings.landingTitle,
      description: strings.landingMetaDescription,
    },
    alternates: { canonical: 'https://prompts.blainercosta.com' },
  };
}

export default function PromptsLanding() {
  const locale = resolveLocale(headers().get('accept-language'));
  const strings = t(locale);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-6 py-20">
          <h1 className="text-4xl md:text-5xl font-medium text-text-primary tracking-display leading-tight mb-6">
            {strings.landingTitleLine1}
            <br />
            {strings.landingTitleLine2}
          </h1>
          <p className="text-lg text-text-secondary leading-relaxed mb-5">
            {strings.landingIntro}
          </p>
          <p className="text-lg text-text-secondary leading-relaxed mb-10">
            {strings.landingIntroSecondary}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <SocialLinks />
            <a
              href={COMMUNITY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors ml-1"
            >
              {strings.landingCtaCommunity}
            </a>
            <a
              href={MENTORIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary rounded-full transition-colors"
            >
              {strings.landingCtaMentorship}
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
