import { getAllAgents } from '@/lib/agents';
import { Header, Footer, AgentGrid, CategoryFilter, SortControl, LinkButton } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import {
  getVoteCountsBatch,
  getUserVotedSet,
  type VoteTarget,
} from '@/lib/supabase/votes';
import type { ListedAgent } from '@/types/agent';
import { parseSortParam, sortAgents } from '@/lib/utils';

export default async function Home({
  searchParams,
}: {
  searchParams: { sort?: string };
}) {
  const sort = parseSortParam(searchParams.sort);
  const officialAgents = getAllAgents();
  const supabase = createClient();

  const [
    communityAgents,
    {
      data: { user },
    },
  ] = await Promise.all([
    getApprovedCommunityAgents(supabase),
    supabase.auth.getUser(),
  ]);

  const listed: ListedAgent[] = [
    ...officialAgents.map((a) => ({ source: 'official' as const, ...a })),
    ...communityAgents.map((a) => ({ source: 'community' as const, ...a })),
  ];

  const targets: VoteTarget[] = listed.map((a) => ({
    type: a.source,
    id: a.source === 'community' ? a.id : a.slug,
  }));

  const [voteCounts, votedSet] = await Promise.all([
    getVoteCountsBatch(supabase, targets),
    user
      ? getUserVotedSet(supabase, user.id, targets)
      : Promise.resolve(new Set<string>()),
  ]);

  const sortedList = sortAgents(listed, sort, voteCounts);

  const totalAgents = listed.length;
  const totalCommunity = communityAgents.length;
  const totalUpvotes = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-14">
          <h1 className="text-4xl md:text-5xl font-medium text-text-primary tracking-display leading-tight mb-5">
            Prompts for Claude Code that people actually use.
          </h1>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed mb-8">
            Copy one in. Submit yours. Let upvotes settle the rest.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <LinkButton href="#agents" variant="ghost" size="lg">
              Browse agents
            </LinkButton>
            <LinkButton href="/submit" variant="primary" size="lg">
              Submit yours →
            </LinkButton>
          </div>

          <p className="text-[13px] text-text-muted">
            <span className="text-text-secondary tabular-nums">{totalAgents}</span> agents
            {totalCommunity > 0 && (
              <>
                {' '}(<span className="tabular-nums">{totalCommunity}</span> from the community)
              </>
            )}
            {' · '}
            <span className="text-text-secondary tabular-nums">{totalUpvotes}</span>{' '}
            {totalUpvotes === 1 ? 'upvote' : 'upvotes'} so far
          </p>
        </section>

        <section id="agents" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <CategoryFilter activeCategory="all" agents={listed} />
            <SortControl active={sort} basePath="/" />
          </div>
          <AgentGrid
            agents={sortedList}
            voteCounts={voteCounts}
            votedSet={votedSet}
            isAuthenticated={!!user}
          />
        </section>
      </main>

      <Footer />
    </div>
  );
}
