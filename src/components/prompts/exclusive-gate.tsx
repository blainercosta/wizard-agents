import { Lock } from 'lucide-react';
import SignInWithGithubButton from '@/components/sign-in-github-button';
import SocialLinks from './social-links';
import { MENTORIA_URL, type I18n } from '@/lib/i18n';

type Props = {
  slug: string;
  isLoggedIn: boolean;
  t: I18n;
};

// Shown when a viewer hits an exclusive (mentees-only) prompt they cannot
// open. Doubles as a conversion surface toward the mentorship.
export default function ExclusiveGate({ slug, isLoggedIn, t }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent-lilac/10 border border-accent-lilac/30 mb-6">
            <Lock className="w-5 h-5 text-accent-lilac" />
          </div>
          <h1 className="text-2xl md:text-3xl font-medium text-text-primary tracking-display leading-tight mb-3">
            {t.gateTitle}
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-8">
            {isLoggedIn ? t.gateSubtitleNoAccess : t.gateSubtitleSignedOut}
          </p>

          <div className="flex items-center justify-center gap-2 flex-wrap">
            {!isLoggedIn && (
              <SignInWithGithubButton
                next={`/${slug}`}
                label={t.gateSignIn}
              />
            )}
            <a
              href={MENTORIA_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary rounded-full transition-colors"
            >
              {t.gateMentorshipCta}
            </a>
          </div>
        </div>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-[13px] text-text-muted">
            {t.madeBy}{' '}
            <span className="text-text-secondary">@_blainercosta</span>
          </p>
          <SocialLinks />
        </div>
      </footer>
    </div>
  );
}
