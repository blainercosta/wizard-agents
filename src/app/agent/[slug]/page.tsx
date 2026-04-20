import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAgentBySlug, getAllSlugs } from '@/lib/agents';
import { formatDate, getCategoryLabel, isNew } from '@/lib/utils';
import { Header, Footer, CopyButton, DownloadButton, MarkdownPreview, ArrowLeftIcon, UpvoteSection } from '@/components';
import { createClient } from '@/lib/supabase/server';
import {
  getVoteCountsBatch,
  getUserVoteState,
  getPublicSupporters,
} from '@/lib/supabase/votes';

interface AgentPageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const slugs = getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: AgentPageProps) {
  const agent = getAgentBySlug(params.slug);

  if (!agent) {
    return {
      title: 'Agent not found - Wizard Agents',
    };
  }

  return {
    title: `${agent.name} - Wizard Agents`,
    description: agent.description,
  };
}

export default async function AgentPage({ params }: AgentPageProps) {
  const agent = getAgentBySlug(params.slug);

  if (!agent) {
    notFound();
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const target = { type: 'official' as const, id: agent.slug };
  const [countsMap, voteState, supporters] = await Promise.all([
    getVoteCountsBatch(supabase, [target]),
    user
      ? getUserVoteState(supabase, user.id, target)
      : Promise.resolve({ voted: false, isPublic: false }),
    getPublicSupporters(supabase, target),
  ]);
  const voteCount = countsMap.get(`official:${agent.slug}`) ?? 0;

  const currentUser = user
    ? {
        username:
          (user.user_metadata?.user_name as string | undefined) ??
          (user.user_metadata?.preferred_username as string | undefined) ??
          'user',
        avatarUrl: (user.user_metadata?.avatar_url as string | undefined) ?? null,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Back button */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-lilac transition-colors mb-8 font-mono text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to list
          </Link>

          {/* Agent Header */}
          <div className="mb-6">
            {/* Title + Version Badge + NEW Tag */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="font-pixel text-lg md:text-xl text-text-primary leading-relaxed">
                {agent.name}
              </h1>
              <span className="px-3 py-1 bg-background-tertiary text-text-muted text-xs font-mono">
                v{agent.version}
              </span>
              {isNew(agent.created) && (
                <span className="px-2 py-1 bg-accent-neon text-background-primary text-xs font-mono font-bold">
                  NEW
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-base text-text-secondary font-mono mb-6">
              {agent.description}
            </p>

            {/* Works with: Compatibility Pills */}
            <div className="mb-3">
              <span className="text-text-muted text-xs font-mono mr-3">Works with:</span>
              <span className="inline-flex flex-wrap gap-2">
                {agent.compatibility.map((item) => (
                  <span
                    key={item}
                    className="px-3 py-1 bg-background-tertiary text-text-secondary text-xs font-mono"
                  >
                    {item}
                  </span>
                ))}
              </span>
            </div>

            {/* Tags: */}
            {agent.tags && agent.tags.length > 0 && (
              <div className="mb-4">
                <span className="text-text-muted text-xs font-mono mr-3">Tags:</span>
                <span className="inline-flex flex-wrap gap-2">
                  {agent.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-transparent border border-accent-lilac text-accent-lilac text-xs font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </span>
              </div>
            )}

            {/* Category + Date */}
            <div className="text-xs text-text-muted font-mono">
              {getCategoryLabel(agent.category)} • Updated on {formatDate(agent.updated)}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 mt-6 mb-8">
            <CopyButton
              content={agent.rawContent}
              label="Copy agent"
              copiedLabel="Copied"
              className="!bg-accent-lilac !text-white !border-accent-lilac !font-bold px-6 py-3"
            />
            <DownloadButton
              content={agent.rawContent}
              filename={`${agent.slug}.md`}
              label="Download .md"
              className="!bg-transparent !border-2 !border-border !text-text-secondary px-6 py-3 hover:!border-accent-lilac hover:!text-accent-lilac"
            />
          </div>

          {/* Upvote + Supporters */}
          <div className="mb-10">
            <UpvoteSection
              targetType="official"
              targetId={agent.slug}
              initialCount={voteCount}
              initialVoted={voteState.voted}
              initialIsPublic={voteState.isPublic}
              isAuthenticated={!!user}
              initialSupporters={supporters}
              currentUser={currentUser}
            />
          </div>

          {/* Content Preview - Only the prompt content, not YAML frontmatter */}
          <div className="bg-background-secondary border-2 border-border">
            <div className="border-b-2 border-border px-6 py-3">
              <span className="text-text-muted text-sm font-mono">
                {agent.slug}.md
              </span>
            </div>
            <div className="p-6 overflow-x-auto overflow-y-auto max-h-[400px]">
              <MarkdownPreview content={agent.content} />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
