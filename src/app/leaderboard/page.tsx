import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Trophy } from 'lucide-react';
import { Header, Footer, LinkButton, VerifiedBadge } from '@/components';
import PeriodToggle from '@/components/period-toggle';
import { createClient } from '@/lib/supabase/server';
import {
  getTopContributors,
  getTopEndorsers,
  getTopAgentsByPeriod,
  parsePeriod,
  PERIOD_LABEL,
  type LeaderEntry,
  type AgentLeaderEntry,
} from '@/lib/supabase/leaderboard';
import { CURATOR_USERNAMES, isCurated } from '@/types/agent';

export const metadata = {
  title: 'Leaderboard - Wizard Agents',
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: { period?: string };
}) {
  const period = parsePeriod(searchParams.period);
  const supabase = createClient();

  const [contributors, endorsers, topAgents] = await Promise.all([
    getTopContributors(supabase, period),
    getTopEndorsers(supabase, period),
    getTopAgentsByPeriod(supabase, period),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-background-primary">
      <Header />
      <main className="flex-1">
        <div className="max-w-3xl mx-auto px-6 py-12">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-10"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> All agents
          </Link>

          <div className="flex items-center gap-3 mb-3">
            <Trophy
              className="w-7 h-7 text-accent-hover"
              strokeWidth={2}
            />
            <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
              Leaderboard
            </h1>
          </div>
          <p className="text-[15px] text-text-muted mb-8">
            Who&apos;s building and supporting the most this {period === 'all' ? 'time' : period}.
          </p>

          <div className="mb-10">
            <PeriodToggle active={period} basePath="/leaderboard" />
          </div>

          <div className="space-y-12">
            <LeaderSection
              title="Top contributors"
              subtitle={`Most agents shipped ${PERIOD_LABEL[period].toLowerCase()}`}
              entries={contributors}
              unit="agent"
              unitPlural="agents"
              emptyMessage="No agents shipped yet in this window."
              emptyCta="Submit yours"
              emptyHref="/submit"
            />

            <LeaderSection
              title="Top endorsers"
              subtitle={`Most public upvotes cast ${PERIOD_LABEL[period].toLowerCase()}`}
              entries={endorsers}
              unit="endorsement"
              unitPlural="endorsements"
              emptyMessage="No public endorsements yet in this window."
              emptyCta="Browse agents"
              emptyHref="/"
            />

            <AgentLeaderSection
              title="Hottest agents"
              subtitle={`Most upvotes received ${PERIOD_LABEL[period].toLowerCase()}`}
              entries={topAgents}
              emptyMessage="No upvote activity yet in this window."
              emptyCta="Browse agents"
              emptyHref="/"
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function LeaderSection({
  title,
  subtitle,
  entries,
  unit,
  unitPlural,
  emptyMessage,
  emptyCta,
  emptyHref,
}: {
  title: string;
  subtitle: string;
  entries: LeaderEntry[];
  unit: string;
  unitPlural: string;
  emptyMessage: string;
  emptyCta: string;
  emptyHref: string;
}) {
  return (
    <section>
      <h2 className="text-[15px] font-semibold text-text-primary tracking-tight mb-1">
        {title}
      </h2>
      <p className="text-[13px] text-text-muted mb-4">{subtitle}</p>

      {entries.length === 0 ? (
        <EmptyState
          message={emptyMessage}
          cta={emptyCta}
          href={emptyHref}
        />
      ) : (
        <ol className="space-y-1.5">
          {entries.map((entry, i) => (
            <li key={entry.username}>
              <Link
                href={`/u/${entry.username}`}
                className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-border rounded-md hover:bg-white/[0.05] hover:border-border-solid transition-colors"
              >
                <span className="w-6 text-center text-[13px] font-mono text-text-muted tabular-nums">
                  {i + 1}
                </span>
                {entry.avatarUrl && (
                  <Image
                    src={entry.avatarUrl}
                    alt={entry.username}
                    width={28}
                    height={28}
                    className="rounded-full border border-border"
                  />
                )}
                <span className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span className="text-[13px] font-medium text-text-primary truncate">
                    @{entry.username}
                  </span>
                  {CURATOR_USERNAMES.has(entry.username) && (
                    <VerifiedBadge className="w-3.5 h-3.5 text-accent-hover shrink-0" />
                  )}
                </span>
                <span className="text-[13px] text-text-secondary tabular-nums shrink-0">
                  <span className="text-text-primary font-medium">{entry.count}</span>{' '}
                  <span className="text-text-muted">
                    {entry.count === 1 ? unit : unitPlural}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function AgentLeaderSection({
  title,
  subtitle,
  entries,
  emptyMessage,
  emptyCta,
  emptyHref,
}: {
  title: string;
  subtitle: string;
  entries: AgentLeaderEntry[];
  emptyMessage: string;
  emptyCta: string;
  emptyHref: string;
}) {
  return (
    <section>
      <h2 className="text-[15px] font-semibold text-text-primary tracking-tight mb-1">
        {title}
      </h2>
      <p className="text-[13px] text-text-muted mb-4">{subtitle}</p>

      {entries.length === 0 ? (
        <EmptyState message={emptyMessage} cta={emptyCta} href={emptyHref} />
      ) : (
        <ol className="space-y-1.5">
          {entries.map((entry, i) => {
            const curated = isCurated(entry.agent);
            return (
              <li key={entry.agent.id}>
                <Link
                  href={`/agent/${entry.agent.slug}`}
                  className="flex items-center gap-3 px-3 py-2 bg-white/[0.02] border border-border rounded-md hover:bg-white/[0.05] hover:border-border-solid transition-colors"
                >
                  <span className="w-6 text-center text-[13px] font-mono text-text-muted tabular-nums">
                    {i + 1}
                  </span>
                  <span className="flex items-center gap-1.5 flex-1 min-w-0">
                    <span className="text-[13px] font-medium text-text-primary truncate">
                      {entry.agent.name}
                    </span>
                    {curated && (
                      <VerifiedBadge className="w-3.5 h-3.5 text-accent-hover shrink-0" />
                    )}
                  </span>
                  <span className="text-[13px] text-text-secondary tabular-nums shrink-0">
                    <span className="text-text-primary font-medium">+{entry.count}</span>{' '}
                    <span className="text-text-muted">
                      {entry.count === 1 ? 'upvote' : 'upvotes'}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

function EmptyState({
  message,
  cta,
  href,
}: {
  message: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-border rounded-lg p-6 text-center">
      <p className="text-[13px] text-text-muted mb-3">{message}</p>
      <LinkButton href={href} variant="ghost" size="sm">
        {cta}
      </LinkButton>
    </div>
  );
}
