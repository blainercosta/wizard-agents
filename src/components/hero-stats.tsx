import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import { getVoteCountsBatch } from '@/lib/supabase/votes';
import { isCurated } from '@/types/agent';

export default async function HeroStats() {
  const supabase = createClient();
  const agents = await getApprovedCommunityAgents(supabase);
  const voteCounts = await getVoteCountsBatch(
    supabase,
    agents.map((a) => a.id)
  );

  const totalAgents = agents.length;
  const totalCommunity = agents.filter((a) => !isCurated(a)).length;
  const totalUpvotes = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0);

  return (
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
  );
}
