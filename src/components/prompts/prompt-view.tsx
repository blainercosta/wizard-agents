import type { Prompt } from '@/types/prompt';
import CopyCounter from './copy-counter';
import CopyButton from './copy-button';
import ReferenceImage from './reference-image';
import SocialLinks from './social-links';
import PromptViewTracker from './prompt-view-tracker';

type Props = {
  prompt: Prompt;
  initialCount: number;
};

export default function PromptView({ prompt, initialCount }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <main className="flex-1">
        <article className="max-w-3xl mx-auto px-6 py-12">
          <PromptViewTracker slug={prompt.slug} />

          <header className="mb-8">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <CopyCounter slug={prompt.slug} initialCount={initialCount} />
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center h-6 px-2.5 text-[11px] font-medium text-text-secondary bg-white/[0.04] rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-3">
              {prompt.title}
            </h1>
            <p className="text-lg text-text-secondary leading-relaxed">
              {prompt.description}
            </p>
          </header>

          {prompt.referenceImage?.src && (
            <div className="mb-8">
              <ReferenceImage image={prompt.referenceImage} priority />
            </div>
          )}

          <section
            aria-labelledby="prompt-heading"
            className="bg-background-secondary border border-border rounded-lg overflow-hidden mb-8"
          >
            <div className="border-b border-border-subtle px-5 py-2.5 flex items-center justify-between">
              <span
                id="prompt-heading"
                className="text-text-muted text-xs font-mono"
              >
                {prompt.slug}.{prompt.format === 'json' ? 'json' : 'txt'}
              </span>
            </div>
            <pre className="font-mono text-[13px] leading-relaxed text-text-secondary p-5 overflow-x-auto whitespace-pre-wrap break-words max-h-[480px] overflow-y-auto">
              {prompt.content}
            </pre>
          </section>

          <CopyButton
            slug={prompt.slug}
            content={prompt.content}
            format={prompt.format}
          />
        </article>
      </main>

      <footer className="border-t border-border-subtle">
        <div className="max-w-3xl mx-auto px-6 py-8 flex items-center justify-between flex-wrap gap-4">
          <p className="text-[13px] text-text-muted">
            Feito por <span className="text-text-secondary">@blainercosta</span>
          </p>
          <SocialLinks />
        </div>
      </footer>
    </div>
  );
}
