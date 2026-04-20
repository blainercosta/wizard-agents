import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAgentsByCategory } from '@/lib/agents';
import { getCategoryLabel } from '@/lib/utils';
import { Category, type ListedAgent } from '@/types/agent';
import { Header, Footer, AgentGrid, CategoryFilter } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { getApprovedCommunityAgents } from '@/lib/supabase/community';
import {
  getVoteCountsBatch,
  getUserVotedSet,
  type VoteTarget,
} from '@/lib/supabase/votes';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const validCategories: Category[] = [
  'design',
  'development',
  'automation',
  'writing',
  'business',
];

export async function generateStaticParams() {
  return validCategories.map((category) => ({ category }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  if (!validCategories.includes(params.category as Category)) {
    return {
      title: 'Category not found - Wizard Agents',
    };
  }

  const categoryLabel = getCategoryLabel(params.category as Category);

  return {
    title: `${categoryLabel} - Wizard Agents`,
    description: `${categoryLabel} agents for Claude Code and Claude Projects.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category as Category;

  if (!validCategories.includes(category)) {
    notFound();
  }

  const officialAgents = getAgentsByCategory(category);
  const supabase = createClient();

  const [
    allCommunity,
    {
      data: { user },
    },
  ] = await Promise.all([
    getApprovedCommunityAgents(supabase),
    supabase.auth.getUser(),
  ]);

  const communityAgents = allCommunity.filter((a) => a.category === category);

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

  const categoryLabel = getCategoryLabel(category);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-16 pb-10">
          <nav className="flex items-center gap-2 text-[13px] mb-4">
            <Link
              href="/"
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              Home
            </Link>
            <span className="text-text-subtle">/</span>
            <span className="text-text-secondary">{categoryLabel}</span>
          </nav>

          <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-3">
            {categoryLabel}
          </h1>
          <p className="text-[15px] text-text-muted">
            {listed.length} agent{listed.length !== 1 ? 's' : ''} in this category
          </p>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-20">
          <CategoryFilter activeCategory={category} />
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
