import type { CommunityAgent } from '@/types/agent';
import AgentCard from './agent-card';

interface AgentGridProps {
  agents: CommunityAgent[];
  voteCounts: Map<string, number>;
  votedSet: Set<string>;
  bookmarkedSet?: Set<string>;
  isAuthenticated: boolean;
  fromCategory?: string;
}

export default function AgentGrid({
  agents,
  voteCounts,
  votedSet,
  bookmarkedSet,
  isAuthenticated,
  fromCategory,
}: AgentGridProps) {
  if (agents.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 border-2 border-border bg-background-secondary mx-auto mb-4 flex items-center justify-center">
          <span className="text-2xl">🔍</span>
        </div>
        <p className="text-text-secondary font-mono">
          No agents in this category yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {agents.map((agent) => (
        <AgentCard
          key={agent.id}
          agent={agent}
          voteCount={voteCounts.get(agent.id) ?? 0}
          hasVoted={votedSet.has(agent.id)}
          hasBookmarked={bookmarkedSet?.has(agent.id) ?? false}
          isAuthenticated={isAuthenticated}
          fromCategory={fromCategory}
        />
      ))}
    </div>
  );
}
