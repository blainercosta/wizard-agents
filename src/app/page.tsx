import { Suspense } from 'react';
import {
  Header,
  Footer,
  LinkButton,
  AgentListing,
  HeroStats,
  ListingSkeleton,
  StatsSkeleton,
} from '@/components';
import type { Category } from '@/types/agent';
import { parseSortParam } from '@/lib/utils';

const validCategories: Category[] = [
  'design',
  'development',
  'automation',
  'writing',
  'business',
  'marketing',
];

function parseCategoryParam(raw: string | string[] | undefined): Category | 'all' {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val && validCategories.includes(val as Category)) return val as Category;
  return 'all';
}

export default function Home({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string };
}) {
  const activeCategory = parseCategoryParam(searchParams.category);
  const sort = parseSortParam(searchParams.sort);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 pt-20 pb-14">
          <h1 className="text-4xl md:text-5xl font-medium text-text-primary tracking-display leading-tight mb-5">
            Prompts for Claude Code that people actually use.
          </h1>
          <p className="text-lg text-text-secondary max-w-xl leading-relaxed mb-8">
            Copy one in. Submit yours. Let upvotes settle the rest.
          </p>

          <div className="flex flex-wrap items-center gap-2 mb-6">
            <LinkButton href="#agents" variant="ghost" size="lg">
              Browse agents
            </LinkButton>
            <LinkButton href="/submit" variant="primary" size="lg">
              Submit yours →
            </LinkButton>
          </div>

          <Suspense fallback={<StatsSkeleton />}>
            <HeroStats />
          </Suspense>
        </section>

        <section id="agents" className="max-w-6xl mx-auto px-6 pb-20 scroll-mt-16">
          <Suspense
            key={`${activeCategory}-${sort}`}
            fallback={<ListingSkeleton />}
          >
            <AgentListing activeCategory={activeCategory} sort={sort} />
          </Suspense>
        </section>
      </main>

      <Footer />
    </div>
  );
}
