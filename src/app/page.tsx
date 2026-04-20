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
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-14">
          <h1 className="text-4xl md:text-5xl font-medium text-text-primary tracking-display leading-tight mb-5">
            Ready-to-use agents for Claude Code
          </h1>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed">
            An open-source library of prompts. Copy one in, and you are done.
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
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
