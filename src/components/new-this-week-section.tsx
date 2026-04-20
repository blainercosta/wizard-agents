import { Sparkles } from 'lucide-react';
import type { CommunityAgent } from '@/types/agent';
import AgentCard from './agent-card';

interface Props {
  agents: CommunityAgent[];
  voteCounts: Map<string, number>;
  votedSet: Set<string>;
  isAuthenticated: boolean;
}

export default function NewThisWeekSection({
  agents,
  voteCounts,
  votedSet,
  isAuthenticated,
}: Props) {
  if (agents.length === 0) return null;

  return (
    <section className="mb-10">
      <div className="flex items-baseline justify-between gap-4 mb-4">
        <h2 className="inline-flex items-center gap-2 text-[15px] font-semibold text-text-primary tracking-tight">
          <Sparkles className="w-4 h-4 text-accent-hover" strokeWidth={2.25} />
          New this week
        </h2>
        <span className="text-xs text-text-muted">
          {agents.length} added in the last 7 days
        </span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            voteCount={voteCounts.get(agent.id) ?? 0}
            hasVoted={votedSet.has(agent.id)}
            isAuthenticated={isAuthenticated}
          />
        ))}
      </div>
    </section>
  );
}
