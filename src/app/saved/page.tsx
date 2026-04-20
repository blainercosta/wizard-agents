import Link from 'next/link';
import { ArrowLeft, Bookmark } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Header, Footer, AgentGrid, LinkButton } from '@/components';
import { createClient } from '@/lib/supabase/server';
import {
  getUserBookmarks,
  getUserBookmarkedSet,
} from '@/lib/supabase/community';
import { getVoteCountsBatch, getUserVotedSet } from '@/lib/supabase/votes';

export const metadata = {
  title: 'Saved agents - Wizard Agents',
};

export default async function SavedPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/submit/login-required');
  }

  const agents = await getUserBookmarks(supabase, user.id);
  const ids = agents.map((a) => a.id);

  const [voteCounts, votedSet, bookmarkedSet] = await Promise.all([
    getVoteCountsBatch(supabase, ids),
    getUserVotedSet(supabase, user.id, ids),
    getUserBookmarkedSet(supabase, user.id),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All agents
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
              Saved
            </h1>
          </div>
          <p className="text-[15px] text-text-muted mb-10">
            {agents.length} agent{agents.length !== 1 ? 's' : ''} you saved for later.
          </p>

          <h2 className="sr-only">Saved agents</h2>

          {agents.length === 0 ? (
            <div className="bg-white/[0.02] border border-border rounded-lg p-10 text-center max-w-2xl mx-auto">
              <Bookmark
                className="w-8 h-8 text-text-muted mx-auto mb-4"
                strokeWidth={1.5}
              />
              <p className="text-text-primary text-[15px] mb-2">
                Nothing saved yet.
              </p>
              <p className="text-text-muted text-[13px] mb-6">
                Click the bookmark icon on any agent card to save it for later.
              </p>
              <LinkButton href="/" variant="primary" size="md">
                Browse agents
              </LinkButton>
            </div>
          ) : (
            <AgentGrid
              agents={agents}
              voteCounts={voteCounts}
              votedSet={votedSet}
              bookmarkedSet={bookmarkedSet}
              isAuthenticated={true}
            />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
