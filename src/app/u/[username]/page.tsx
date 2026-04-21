import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Github } from 'lucide-react';
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
          <section className="mb-14">
            <div className="flex items-start gap-6 flex-wrap mb-8">
              {profile.avatarUrl && (
                <Image
                  src={profile.avatarUrl}
                  alt={profile.username}
                  width={88}
                  height={88}
                  className="rounded-full border border-border shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
                    @{profile.username}
                  </h1>
                  {isCurator && (
                    <VerifiedBadge className="w-6 h-6 text-accent-hover shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {isCurator ? (
                    <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-hover bg-accent-brand/15 border border-accent-brand/40 rounded-full">
                      Maintainer
                    </span>
                  ) : (
                    <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-lilac border border-accent-lilac/40 rounded-full">
                      Community contributor
                    </span>
                  )}
                  <a
                    href={`https://github.com/${profile.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 h-5 px-2 text-[10px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
                  >
                    <Github className="w-3 h-3" />
                    GitHub
                  </a>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 max-w-lg">
              <StatBlock value={submissions.length} label="agents" />
              <StatBlock value={upvotesReceived} label="upvotes received" />
              <StatBlock value={endorsements.length} label="endorsements" />
            </div>
          </section>

          {submissions.length > 0 && (
            <section className="mb-14">
              <div className="flex items-baseline justify-between gap-4 mb-5">
                <h2 className="text-xl font-medium text-text-primary tracking-tight">
                  Agents
                </h2>
                <span className="text-[13px] text-text-muted tabular-nums">
                  {submissions.length} total
                </span>
              </div>
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
              <div className="flex items-baseline justify-between gap-4 mb-1">
                <h2 className="text-xl font-medium text-text-primary tracking-tight">
                  Endorsements
                </h2>
                <span className="text-[13px] text-text-muted tabular-nums">
                  {endorsements.length} total
                </span>
              </div>
              <p className="text-[13px] text-text-muted mb-5">
                Agents @{profile.username} publicly supports.
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
              <p className="text-text-primary text-[15px] mb-1">Nothing here yet.</p>
              <p className="text-text-muted text-[13px]">
                @{profile.username} hasn&apos;t submitted or endorsed any agents.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="bg-white/[0.02] border border-border rounded-lg px-4 py-3">
      <div className="text-2xl font-medium text-text-primary tabular-nums tracking-tight leading-none mb-1">
        {value}
      </div>
      <div className="text-[11px] text-text-muted uppercase tracking-wide">
        {label}
      </div>
    </div>
  );
}
