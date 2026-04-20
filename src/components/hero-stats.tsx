import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import { getVoteCountsBatch } from '@/lib/supabase/votes';
import { isCurated } from '@/types/agent';

export default async function HeroStats() {
  const supabase = createClient();
  const agents = await getApprovedCommunityAgents(supabase);
  const voteCounts = await getVoteCountsBatch(supabase, agents.map((a) => a.id));

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { count: votesThisWeek } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', 'community')
    .gte('created_at', weekAgo);

  const totalAgents = agents.length;
  const totalCommunity = agents.filter((a) => !isCurated(a)).length;
  const totalUpvotes = Array.from(voteCounts.values()).reduce((a, b) => a + b, 0);
  const agentsThisWeek = agents.filter(
    (a) => new Date(a.created).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  return (
    <p className="text-[13px] text-text-muted">
      <span className="text-text-secondary tabular-nums">{totalAgents}</span> agents
      {agentsThisWeek > 0 && (
        <>
          {' '}<span className="text-accent-hover tabular-nums">+{agentsThisWeek}</span>{' '}
          <span className="text-text-muted">this week</span>
        </>
      )}
      {totalCommunity > 0 && (
        <>
          {' · '}
          <span className="text-text-secondary tabular-nums">{totalCommunity}</span> from the community
        </>
      )}
      {' · '}
      <span className="text-text-secondary tabular-nums">{totalUpvotes}</span>{' '}
      {totalUpvotes === 1 ? 'upvote' : 'upvotes'}
      {votesThisWeek && votesThisWeek > 0 && (
        <>
          {' '}<span className="text-accent-hover tabular-nums">+{votesThisWeek}</span>{' '}
          <span className="text-text-muted">this week</span>
        </>
      )}
    </p>
  );
}
