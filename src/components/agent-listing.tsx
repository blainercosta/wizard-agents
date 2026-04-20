import { getAllAgents } from '@/lib/agents';
import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import {
  getVoteCountsBatch,
  getUserVotedSet,
  type VoteTarget,
} from '@/lib/supabase/votes';
import { sortAgents } from '@/lib/utils';
import type { Category, ListedAgent } from '@/types/agent';
import type { SortKey } from './sort-control';
import CategoryFilter from './category-filter';
import SortControl from './sort-control';
import AgentGrid from './agent-grid';

interface Props {
  activeCategory: Category | 'all';
  sort: SortKey;
}

export default async function AgentListing({ activeCategory, sort }: Props) {
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

  const filtered =
    activeCategory === 'all'
      ? listed
      : listed.filter((a) => a.category === activeCategory);

  const targets: VoteTarget[] = filtered.map((a) => ({
    type: a.source,
    id: a.source === 'community' ? a.id : a.slug,
  }));

  const [voteCounts, votedSet] = await Promise.all([
    getVoteCountsBatch(supabase, targets),
    user
      ? getUserVotedSet(supabase, user.id, targets)
      : Promise.resolve(new Set<string>()),
  ]);

  const sorted = sortAgents(filtered, sort, voteCounts);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <CategoryFilter
          activeCategory={activeCategory}
          agents={listed}
          currentSort={sort}
        />
        <SortControl active={sort} currentCategory={activeCategory} />
      </div>
      <AgentGrid
        agents={sorted}
        voteCounts={voteCounts}
        votedSet={votedSet}
        isAuthenticated={!!user}
        fromCategory={activeCategory === 'all' ? undefined : activeCategory}
      />
    </>
  );
}
