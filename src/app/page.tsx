import { getAllAgents } from '@/lib/agents';
import { Header, Footer, AgentGrid, CategoryFilter } from '@/components';

export default function Home() {
  const agents = getAllAgents();

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
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

        {/* Agents Section */}
        <section className="max-w-6xl mx-auto px-4">
          <CategoryFilter activeCategory="all" />
          <AgentGrid agents={agents} />
        </section>
      </main>

      <Footer />
    </div>
  );
}
