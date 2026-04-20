import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import { getVoteCountsBatch, getUserVotedSet } from '@/lib/supabase/votes';
import { sortAgents, isNew } from '@/lib/utils';
import type { Category } from '@/types/agent';
import type { SortKey } from './sort-control';
import CategoryFilter from './category-filter';
import SortControl from './sort-control';
import AgentGrid from './agent-grid';
import NewThisWeekSection from './new-this-week-section';

interface Props {
  activeCategory: Category | 'all';
  sort: SortKey;
}

export default async function AgentListing({ activeCategory, sort }: Props) {
  const supabase = createClient();
  const [allAgents, { data: { user } }] = await Promise.all([
    getApprovedCommunityAgents(supabase),
    supabase.auth.getUser(),
  ]);

  const filtered =
    activeCategory === 'all'
      ? allAgents
      : allAgents.filter((a) => a.category === activeCategory);

  const ids = filtered.map((a) => a.id);

  const [voteCounts, votedSet] = await Promise.all([
    getVoteCountsBatch(supabase, ids),
    user
      ? getUserVotedSet(supabase, user.id, ids)
      : Promise.resolve(new Set<string>()),
  ]);

  const sorted = sortAgents(filtered, sort, voteCounts);

  // "New this week" highlight only shows on the unfiltered, default-sorted view
  // so it doesn't compete with the user's active filter or sort intent.
  const showHighlight = activeCategory === 'all' && sort === 'recent';
  const highlightAgents = showHighlight
    ? filtered
        .filter((a) => isNew(a.created, 7))
        .sort((a, b) => new Date(b.created).getTime() - new Date(a.created).getTime())
        .slice(0, 6)
    : [];

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

      {highlightAgents.length > 0 && (
        <NewThisWeekSection
          agents={highlightAgents}
          voteCounts={voteCounts}
          votedSet={votedSet}
          isAuthenticated={!!user}
        />
      )}

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
