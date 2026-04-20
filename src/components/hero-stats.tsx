import { getAllAgents } from '@/lib/agents';
import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import {
  getVoteCountsBatch,
  type VoteTarget,
} from '@/lib/supabase/votes';

export default async function HeroStats() {
  const officialAgents = getAllAgents();
  const supabase = createClient();
  const communityAgents = await getApprovedCommunityAgents(supabase);

  const targets: VoteTarget[] = [
    ...officialAgents.map((a) => ({ type: 'official' as const, id: a.slug })),
    ...communityAgents.map((a) => ({ type: 'community' as const, id: a.id })),
  ];

  const voteCounts = await getVoteCountsBatch(supabase, targets);

  const totalAgents = officialAgents.length + communityAgents.length;
  const totalCommunity = communityAgents.length;
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
