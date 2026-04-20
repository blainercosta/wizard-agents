import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Github } from 'lucide-react';
import {
  Header,
  Footer,
  AgentGrid,
  VerifiedBadge,
} from '@/components';
import { createClient } from '@/lib/supabase/server';
import {
  getUserProfileByUsername,
  getAgentsByAuthor,
  getPublicEndorsementsByUser,
  getUserBookmarkedSet,
} from '@/lib/supabase/community';
import { getVoteCountsBatch, getUserVotedSet } from '@/lib/supabase/votes';
import { CURATOR_USERNAMES } from '@/types/agent';

interface ProfilePageProps {
  params: { username: string };
}

export async function generateMetadata({ params }: ProfilePageProps) {
  return {
    title: `@${params.username} - Wizard Agents`,
    description: `Agents and endorsements from @${params.username}.`,
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const username = decodeURIComponent(params.username).replace(/^@/, '');
  const supabase = createClient();

  const profile = await getUserProfileByUsername(supabase, username);
  if (!profile) notFound();

  const [
    submissions,
    endorsements,
    {
      data: { user },
    },
  ] = await Promise.all([
    getAgentsByAuthor(supabase, username),
    getPublicEndorsementsByUser(supabase, username),
    supabase.auth.getUser(),
  ]);

  const allIds = [
    ...submissions.map((a) => a.id),
    ...endorsements.map((a) => a.id),
  ];
  const uniqueIds = Array.from(new Set(allIds));

  const [voteCounts, votedSet, bookmarkedSet] = await Promise.all([
    getVoteCountsBatch(supabase, uniqueIds),
    user
      ? getUserVotedSet(supabase, user.id, uniqueIds)
      : Promise.resolve(new Set<string>()),
    user
      ? getUserBookmarkedSet(supabase, user.id)
      : Promise.resolve(new Set<string>()),
  ]);

  const upvotesReceived = submissions.reduce(
    (sum, a) => sum + (voteCounts.get(a.id) ?? 0),
    0
  );
  const isCurator = CURATOR_USERNAMES.has(username);

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

          <div className="flex items-start gap-5 mb-10 flex-wrap">
            {profile.avatarUrl && (
              <Image
                src={profile.avatarUrl}
                alt={profile.username}
                width={72}
                height={72}
                className="rounded-full border border-border"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
                  @{profile.username}
                </h1>
                {isCurator && (
                  <VerifiedBadge className="w-6 h-6 text-accent-hover shrink-0" />
                )}
              </div>
              <p className="text-[13px] text-text-muted mb-3">
                {isCurator ? 'Maintainer' : 'Community contributor'}
              </p>

              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[13px] mb-4">
                <span>
                  <span className="text-text-secondary tabular-nums">
                    {submissions.length}
                  </span>{' '}
                  <span className="text-text-muted">
                    {submissions.length === 1 ? 'agent' : 'agents'}
                  </span>
                </span>
                <span>
                  <span className="text-text-secondary tabular-nums">
                    {upvotesReceived}
                  </span>{' '}
                  <span className="text-text-muted">
                    {upvotesReceived === 1 ? 'upvote received' : 'upvotes received'}
                  </span>
                </span>
                <span>
                  <span className="text-text-secondary tabular-nums">
                    {endorsements.length}
                  </span>{' '}
                  <span className="text-text-muted">
                    {endorsements.length === 1 ? 'endorsement' : 'endorsements'}
                  </span>
                </span>
              </div>

              <a
                href={`https://github.com/${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium text-text-secondary bg-white/[0.02] border border-border rounded-md hover:bg-white/[0.05] hover:text-text-primary transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
                View on GitHub
              </a>
            </div>
          </div>

          {submissions.length > 0 && (
            <section className="mb-12">
              <h2 className="text-[15px] font-semibold text-text-primary tracking-tight mb-4">
                Agents by @{profile.username}
              </h2>
              <AgentGrid
                agents={submissions}
                voteCounts={voteCounts}
                votedSet={votedSet}
                bookmarkedSet={bookmarkedSet}
                isAuthenticated={!!user}
              />
            </section>
          )}

          {endorsements.length > 0 && (
            <section>
              <h2 className="text-[15px] font-semibold text-text-primary tracking-tight mb-1">
                Endorsed by @{profile.username}
              </h2>
              <p className="text-[13px] text-text-muted mb-4">
                Agents they publicly support.
              </p>
              <AgentGrid
                agents={endorsements}
                voteCounts={voteCounts}
                votedSet={votedSet}
                bookmarkedSet={bookmarkedSet}
                isAuthenticated={!!user}
              />
            </section>
          )}

          {submissions.length === 0 && endorsements.length === 0 && (
            <div className="bg-white/[0.02] border border-border rounded-lg p-10 text-center max-w-2xl mx-auto">
              <p className="text-text-muted text-[15px]">
                @{profile.username} hasn&apos;t submitted or publicly endorsed
                any agents yet.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
