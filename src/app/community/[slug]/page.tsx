import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { formatDate, getCategoryLabel, isNew } from '@/lib/utils';
import {
  Header,
  Footer,
  CopyButton,
  DownloadButton,
  MarkdownPreview,
  ArrowLeftIcon,
  UpvoteSection,
} from '@/components';
import { createClient } from '@/lib/supabase/server';
import { getCommunityAgentBySlug } from '@/lib/supabase/community';
import {
  getVoteCountsBatch,
  getUserVoteState,
  getPublicSupporters,
} from '@/lib/supabase/votes';

interface CommunityAgentPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CommunityAgentPageProps) {
  const supabase = createClient();
  const agent = await getCommunityAgentBySlug(supabase, params.slug);
  if (!agent) return { title: 'Agent not found - Wizard Agents' };
  return {
    title: `${agent.name} - Wizard Agents`,
    description: agent.description,
  };
}

export default async function CommunityAgentPage({
  params,
}: CommunityAgentPageProps) {
  const supabase = createClient();
  const agent = await getCommunityAgentBySlug(supabase, params.slug);

  if (!agent) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const target = { type: 'community' as const, id: agent.id };
  const [countsMap, voteState, supporters] = await Promise.all([
    getVoteCountsBatch(supabase, [target]),
    user
      ? getUserVoteState(supabase, user.id, target)
      : Promise.resolve({ voted: false, isPublic: false }),
    getPublicSupporters(supabase, target),
  ]);
  const voteCount = countsMap.get(`community:${agent.id}`) ?? 0;

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
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-text-secondary hover:text-accent-lilac transition-colors mb-8 font-mono text-sm"
          >
            <ArrowLeftIcon className="w-4 h-4" /> Back to list
          </Link>

          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <h1 className="font-pixel text-lg md:text-xl text-text-primary leading-relaxed">
                {agent.name}
              </h1>
              <span className="px-3 py-1 bg-background-tertiary text-text-muted text-xs font-mono">
                v{agent.version}
              </span>
              <span className="px-2 py-1 bg-accent-lilac text-white text-xs font-mono font-bold">
                COMMUNITY
              </span>
              {isNew(agent.created) && (
                <span className="px-2 py-1 bg-accent-neon text-background-primary text-xs font-mono font-bold">
                  NEW
                </span>
              )}
            </div>

            <p className="text-base text-text-secondary font-mono mb-6">
              {agent.description}
            </p>

            <div className="mb-3 flex items-center gap-2">
              <span className="text-text-muted text-xs font-mono">By:</span>
              <a
                href={`https://github.com/${agent.author.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-border px-2 py-1 hover:border-accent-lilac transition-colors"
              >
                {agent.author.avatarUrl && (
                  <Image
                    src={agent.author.avatarUrl}
                    alt={agent.author.username}
                    width={18}
                    height={18}
                    className="border border-border"
                  />
                )}
                <span className="font-mono text-xs text-text-secondary">
                  @{agent.author.username}
                </span>
              </a>
            </div>

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

            <div className="text-xs text-text-muted font-mono">
              {getCategoryLabel(agent.category)} • Updated on {formatDate(agent.updated)}
            </div>
          </div>

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

          <div className="mb-10">
            <UpvoteSection
              targetType="community"
              targetId={agent.id}
              initialCount={voteCount}
              initialVoted={voteState.voted}
              initialIsPublic={voteState.isPublic}
              isAuthenticated={!!user}
              initialSupporters={supporters}
              currentUser={currentUser}
            />
          </div>

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
