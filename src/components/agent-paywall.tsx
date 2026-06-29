import Link from 'next/link';
import { ArrowLeft, Lock } from 'lucide-react';
import { Header, Footer } from '@/components';
import SignInWithGithubButton from './sign-in-github-button';
import { getCategoryLabel } from '@/lib/utils';
import { MENTORIA_URL } from '@/lib/i18n';
import type { CommunityAgent } from '@/types/agent';

type Props = {
  agent: CommunityAgent;
  isLoggedIn: boolean;
};

// Detail-page paywall for an exclusive agent the viewer can't open. Shows
// the metadata (FOMO) but never the content, and routes toward the
// mentorship.
export default function AgentPaywall({ agent, isLoggedIn }: Props) {
  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All agents
          </Link>

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
                {agent.name}
              </h1>
              <span className="inline-flex items-center gap-1 h-5 px-2 text-[11px] font-medium text-accent-lilac bg-accent-lilac/10 border border-accent-lilac/30 rounded-full">
                <Lock className="w-3 h-3" />
                Exclusivo mentorados
              </span>
            </div>
            <p className="text-lg text-text-secondary leading-relaxed mb-4">
              {agent.description}
            </p>
            <div className="text-[13px] text-text-muted">
              {getCategoryLabel(agent.category, agent.categoryLabel)} · por @
              {agent.author.username}
            </div>
          </div>

          {/* Locked content surface */}
          <div className="relative bg-white/[0.02] border border-border rounded-lg overflow-hidden mb-8">
            <div
              aria-hidden
              className="p-5 select-none blur-[6px] opacity-40 space-y-2"
            >
              {[
                'w-11/12',
                'w-9/12',
                'w-10/12',
                'w-7/12',
                'w-11/12',
                'w-8/12',
              ].map((w, i) => (
                <div key={i} className={`h-3 rounded bg-white/20 ${w}`} />
              ))}
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 bg-background-primary/40">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-accent-lilac/10 border border-accent-lilac/30 mb-4">
                <Lock className="w-5 h-5 text-accent-lilac" />
              </div>
              <p className="text-[15px] font-medium text-text-primary mb-1">
                Conteúdo exclusivo pra mentorados
              </p>
              <p className="text-[13px] text-text-muted max-w-sm mb-5">
                {isLoggedIn
                  ? 'Sua conta ainda não está na lista de mentorados. Entre na mentoria pra desbloquear este e os outros agentes exclusivos.'
                  : 'Entre com o GitHub pra checar seu acesso, ou conheça a mentoria pra desbloquear os agentes exclusivos.'}
              </p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <a
                  href={MENTORIA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center h-9 px-4 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors"
                >
                  Quero ser mentorado
                </a>
                {!isLoggedIn && (
                  <SignInWithGithubButton
                    next={`/agent/${agent.slug}`}
                    label="Entrar com GitHub"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
