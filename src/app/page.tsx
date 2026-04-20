import { getAllAgents } from '@/lib/agents';
import { Header, Footer, AgentGrid, CategoryFilter } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import {
  getVoteCountsBatch,
  getUserVotedSet,
  type VoteTarget,
} from '@/lib/supabase/votes';
import type { ListedAgent } from '@/types/agent';

export default async function Home() {
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
  ].sort(
    (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );

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

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        <section className="border-b border-border bg-background-secondary mb-8">
          <div className="max-w-6xl mx-auto px-4 pt-16 pb-12">
            <h1 className="font-pixel text-xl md:text-2xl text-text-primary mb-4 leading-relaxed">
              WIZARD<span className="text-accent-neon">_</span>AGENTS
            </h1>
            <p className="text-text-secondary font-mono text-sm md:text-base max-w-xl mb-2">
              Ready-to-use agents for Claude Code.
            </p>
            <p className="text-text-muted font-mono text-sm">
              Copy. Use. Done.
            </p>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-4">
          <CategoryFilter activeCategory="all" />
          <AgentGrid
            agents={listed}
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
