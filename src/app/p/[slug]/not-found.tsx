import Link from 'next/link';
import { headers } from 'next/headers';
import { resolveLocale, t } from '@/lib/i18n';

export default function PromptNotFound() {
  const strings = t(resolveLocale(headers().get('accept-language')));

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-md mx-auto px-6 py-16 text-center">
          <h1 className="text-2xl font-medium text-text-primary tracking-tight mb-3">
            {strings.notFoundTitle}
          </h1>
          <p className="text-[15px] text-text-secondary leading-relaxed mb-6">
            {strings.notFoundSubtitle}
          </p>
          <Link
            href="/p"
            className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
          >
            {strings.notFoundBack}
          </Link>
        </div>
      </main>
    </div>
  );
}
