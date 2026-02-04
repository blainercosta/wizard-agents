import { AgentCard as AgentCardType } from '@/types/agent';
import AgentCard from './agent-card';

interface AgentGridProps {
  agents: AgentCardType[];
}

export default function AgentGrid({ agents }: AgentGridProps) {
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
        <AgentCard key={agent.slug} agent={agent} />
      ))}
    </div>
  );
}
