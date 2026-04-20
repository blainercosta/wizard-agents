import { createClient } from '@/lib/supabase/server';
import {
  getCachedApprovedAgents,
  getUserBookmarkedSet,
} from '@/lib/supabase/community';
import { getVoteCountsBatch, getUserVotedSet } from '@/lib/supabase/votes';
import { sortAgents } from '@/lib/utils';
import type { Category } from '@/types/agent';
import type { SortKey } from './sort-control';
import CategoryFilter from './category-filter';
import SortControl from './sort-control';
import AgentGrid from './agent-grid';

interface Props {
  activeCategory: Category | 'all';
  sort: SortKey;
}

export default async function AgentListing({ activeCategory, sort }: Props) {
  const supabase = createClient();
  const [allAgents, { data: { user } }] = await Promise.all([
    getCachedApprovedAgents(),
    supabase.auth.getUser(),
  ]);

  const filtered =
    activeCategory === 'all'
      ? allAgents
      : allAgents.filter((a) => a.category === activeCategory);

  const ids = filtered.map((a) => a.id);

  const [voteCounts, votedSet, bookmarkedSet] = await Promise.all([
    getVoteCountsBatch(supabase, ids),
    user
      ? getUserVotedSet(supabase, user.id, ids)
      : Promise.resolve(new Set<string>()),
    user
      ? getUserBookmarkedSet(supabase, user.id)
      : Promise.resolve(new Set<string>()),
  ]);

  const sorted = sortAgents(filtered, sort, voteCounts);

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <CategoryFilter
          activeCategory={activeCategory}
          agents={allAgents}
          currentSort={sort}
        />
        <SortControl active={sort} currentCategory={activeCategory} />
      </div>

      <AgentGrid
        agents={sorted}
        voteCounts={voteCounts}
        votedSet={votedSet}
        bookmarkedSet={bookmarkedSet}
        isAuthenticated={!!user}
        fromCategory={activeCategory === 'all' ? undefined : activeCategory}
      />
    </>
  );
}
