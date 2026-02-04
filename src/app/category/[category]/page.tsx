import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAgentsByCategory } from '@/lib/agents';
import { getCategoryLabel } from '@/lib/utils';
import { Category } from '@/types/agent';
import { Header, Footer, AgentGrid, CategoryFilter } from '@/components';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const validCategories: Category[] = ['design', 'development', 'automation', 'writing', 'business'];

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

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = params.category as Category;

  if (!validCategories.includes(category)) {
    notFound();
  }

  const agents = getAgentsByCategory(category);
  const categoryLabel = getCategoryLabel(category);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-background-secondary mb-8">
          <div className="max-w-6xl mx-auto px-4 pt-16 pb-12">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm font-mono mb-4">
              <Link
                href="/"
                className="text-text-muted hover:text-accent-lilac transition-colors"
              >
                Home
              </Link>
              <span className="text-text-muted">/</span>
              <span className="text-accent-lilac">{categoryLabel}</span>
            </nav>

            <h1 className="font-pixel text-xl md:text-2xl text-text-primary mb-4 leading-relaxed">
              {categoryLabel.toUpperCase()}
              <span className="text-accent-neon">_</span>AGENTS
            </h1>
            <p className="text-text-secondary font-mono text-sm md:text-base max-w-xl">
              {agents.length} agent{agents.length !== 1 ? 's' : ''} in this category.
            </p>
          </div>
        </section>

        {/* Agents Section */}
        <section className="max-w-6xl mx-auto px-4">
          <CategoryFilter activeCategory={category} />
          <AgentGrid agents={agents} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
