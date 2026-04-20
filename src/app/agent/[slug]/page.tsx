import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { formatDate, getCategoryLabel, isNew } from '@/lib/utils';
import {
  Header,
  Footer,
  CopyButton,
  DownloadButton,
  MarkdownPreview,
  UpvoteSection,
  VerifiedBadge,
} from '@/components';
import { createClient } from '@/lib/supabase/server';
import { getCommunityAgentBySlug } from '@/lib/supabase/community';
import {
  getVoteCountsBatch,
  getUserVoteState,
  getPublicSupporters,
} from '@/lib/supabase/votes';
import { Category, isCurated } from '@/types/agent';

interface AgentPageProps {
  params: { slug: string };
  searchParams: { from?: string };
}

const validCategories: Category[] = [
  'design',
  'development',
  'automation',
  'writing',
  'business',
  'marketing',
];

export async function generateMetadata({ params }: AgentPageProps) {
  const supabase = createClient();
  const agent = await getCommunityAgentBySlug(supabase, params.slug);
  if (!agent) return { title: 'Agent not found - Wizard Agents' };
  return {
    title: `${agent.name} - Wizard Agents`,
    description: agent.description,
  };
}

export default async function AgentPage({ params, searchParams }: AgentPageProps) {
  const supabase = createClient();
  const agent = await getCommunityAgentBySlug(supabase, params.slug);

  if (!agent) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [countsMap, voteState, supporters] = await Promise.all([
    getVoteCountsBatch(supabase, [agent.id]),
    user
      ? getUserVoteState(supabase, user.id, agent.id)
      : Promise.resolve({ voted: false, isPublic: false }),
    getPublicSupporters(supabase, agent.id),
  ]);
  const voteCount = countsMap.get(agent.id) ?? 0;

  const currentUser = user
    ? {
        username:
          (user.user_metadata?.user_name as string | undefined) ??
          (user.user_metadata?.preferred_username as string | undefined) ??
          'user',
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }
    : null;

  const fromCategory =
    searchParams.from && validCategories.includes(searchParams.from as Category)
      ? (searchParams.from as Category)
      : null;
  const backHref = fromCategory ? `/?category=${fromCategory}` : '/';
  const backLabel = fromCategory
    ? `Back to ${getCategoryLabel(fromCategory)}`
    : 'All agents';

  const curated = isCurated(agent);
  const showAuthor = !curated;

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> {backLabel}
          </Link>

          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
                  {agent.name}
                </h1>
                {curated && (
                  <VerifiedBadge className="w-6 h-6 text-accent-hover shrink-0" />
                )}
              </div>
              <span className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-muted bg-white/[0.04] rounded-full">
                v{agent.version}
              </span>
              {showAuthor && (
                <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-lilac border border-accent-lilac/40 rounded-full">
                  Community
                </span>
              )}
              {isNew(agent.created) && (
                <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-text-primary bg-white/[0.08] border border-border rounded-full">
                  New
                </span>
              )}
            </div>

            <p className="text-lg text-text-secondary leading-relaxed mb-6">
              {agent.description}
            </p>

            <div className="flex flex-col gap-2.5 text-[13px]">
              {showAuthor && (
                <div className="flex items-center gap-2">
                  <span className="text-text-muted shrink-0">By</span>
                  <a
                    href={`https://github.com/${agent.author.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-6 pl-0.5 pr-2 rounded-full bg-white/[0.04] border border-border-subtle hover:bg-white/[0.08] transition-colors"
                  >
                    {agent.author.avatarUrl && (
                      <Image
                        src={agent.author.avatarUrl}
                        alt={agent.author.username}
                        width={18}
                        height={18}
                        className="rounded-full"
                      />
                    )}
                    <span className="text-xs text-text-secondary">
                      @{agent.author.username}
                    </span>
                  </a>
                </div>
              )}

              {agent.tags && agent.tags.length > 0 && (
                <div className="flex items-start gap-2 flex-wrap">
                  <span className="text-text-muted shrink-0">Tags</span>
                  <span className="inline-flex flex-wrap gap-1.5">
                    {agent.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-secondary bg-white/[0.04] rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </span>
                </div>
              )}

              <div className="text-text-muted">
                {getCategoryLabel(agent.category)} · Updated on {formatDate(agent.updated)}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-10">
            <CopyButton
              content={agent.rawContent}
              label="Copy prompt"
              copiedLabel="Copied"
              className="h-9 px-4 text-white bg-accent-brand hover:bg-accent-hover rounded-md"
            />
            <DownloadButton
              content={agent.rawContent}
              filename={`${agent.slug}.md`}
              label="Download"
              className="h-9 px-4 text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary rounded-md"
            />
          </div>

          <div className="mb-12">
            <UpvoteSection
              targetId={agent.id}
              initialCount={voteCount}
              initialVoted={voteState.voted}
              initialIsPublic={voteState.isPublic}
              isAuthenticated={!!user}
              initialSupporters={supporters}
              currentUser={currentUser}
            />
          </div>

          <div className="bg-white/[0.02] border border-border rounded-lg overflow-hidden">
            <div className="border-b border-border-subtle px-5 py-2.5">
              <span className="text-text-muted text-xs font-mono">
                {agent.slug}.md
              </span>
            </div>
            <div className="p-5 overflow-x-auto overflow-y-auto max-h-[480px]">
              <MarkdownPreview content={agent.content} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
