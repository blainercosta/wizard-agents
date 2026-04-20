import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components';
import ModerationCard from '@/components/moderation-card';
import { createClient } from '@/lib/supabase/server';
import {
  getCommunityAgentsByStatus,
  getModerationCounts,
  isCurrentUserAdmin,
} from '@/lib/supabase/community';
import { formatDate, getCategoryLabel } from '@/lib/utils';
import type { CommunityAgent } from '@/types/agent';

export const metadata = {
  title: 'Moderation queue - Wizard Agents',
};

type Status = 'pending' | 'approved' | 'rejected';

function parseStatus(raw: string | undefined): Status {
  if (raw === 'approved' || raw === 'rejected') return raw;
  return 'pending';
}

export default async function AdminPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const supabase = createClient();
  const isAdmin = await isCurrentUserAdmin(supabase);

  if (!isAdmin) {
    notFound();
  }

  const status = parseStatus(searchParams.status);
  const [agents, counts] = await Promise.all([
    getCommunityAgentsByStatus(supabase, status),
    getModerationCounts(supabase),
  ]);

  const tabs: { key: Status; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
  ];

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

          <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight mb-3">
            Moderation
          </h1>
          <p className="text-[15px] text-text-muted mb-8">
            Review and track decisions on community submissions.
          </p>

          <div className="inline-flex items-center gap-1 p-0.5 bg-white/[0.02] border border-border rounded-full mb-8">
            {tabs.map(({ key, label }) => {
              const href =
                key === 'pending' ? '/admin' : `/admin?status=${key}`;
              const isActive = status === key;
              return (
                <Link
                  key={key}
                  href={href}
                  className={`inline-flex items-center gap-1.5 h-7 px-3 text-xs font-medium rounded-full transition-colors ${
                    isActive
                      ? 'bg-white/[0.08] text-text-primary'
                      : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  {label}
                  <span className="tabular-nums text-text-muted">
                    {counts[key]}
                  </span>
                </Link>
              );
            })}
          </div>

          {agents.length === 0 ? (
            <div className="bg-white/[0.02] border border-border rounded-lg p-10 text-center">
              <p className="text-text-muted text-[15px]">
                {status === 'pending'
                  ? 'All caught up — no pending submissions.'
                  : status === 'approved'
                    ? 'No approved submissions yet.'
                    : 'No rejected submissions.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {status === 'pending'
                ? agents.map((agent) => (
                    <ModerationCard key={agent.id} agent={agent} />
                  ))
                : agents.map((agent) => (
                    <HistoryCard key={agent.id} agent={agent} status={status} />
                  ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function HistoryCard({
  agent,
  status,
}: {
  agent: CommunityAgent;
  status: 'approved' | 'rejected';
}) {
  const isApproved = status === 'approved';
  const href = `/agent/${agent.slug}`;

  return (
    <article className="bg-white/[0.02] border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {isApproved ? (
              <Link
                href={href}
                className="text-[15px] font-semibold text-text-primary tracking-tight hover:text-accent-lilac transition-colors"
              >
                {agent.name}
              </Link>
            ) : (
              <span className="text-[15px] font-semibold text-text-primary tracking-tight">
                {agent.name}
              </span>
            )}
            <span className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-muted bg-white/[0.04] rounded-full">
              v{agent.version}
            </span>
            <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-lilac border border-accent-lilac/40 rounded-full">
              {getCategoryLabel(agent.category)}
            </span>
            <span
              className={`inline-flex items-center h-5 px-2 text-[10px] font-medium rounded-full border ${
                isApproved
                  ? 'text-accent-neon border-accent-neon/40'
                  : 'text-red-400 border-red-500/40'
              }`}
            >
              {isApproved ? 'Approved' : 'Rejected'}
            </span>
          </div>
          <div className="text-xs text-text-muted">
            /{agent.slug} · decided {formatDate(agent.updated)}
          </div>
        </div>
        <a
          href={`https://github.com/${agent.author.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 h-7 pl-1 pr-2.5 rounded-full bg-white/[0.04] border border-border-subtle hover:bg-white/[0.08] transition-colors"
        >
          {agent.author.avatarUrl && (
            <Image
              src={agent.author.avatarUrl}
              alt={agent.author.username}
              width={20}
              height={20}
              className="rounded-full"
            />
          )}
          <span className="text-xs text-text-secondary">
            @{agent.author.username}
          </span>
        </a>
      </div>

      <p className="text-[13px] leading-relaxed text-text-secondary">
        {agent.description}
      </p>

      {agent.rejectionReason && (
        <p className="mt-3 text-[13px] text-text-secondary bg-red-500/5 border border-red-500/20 rounded-md px-3 py-2">
          <span className="text-red-400 font-medium">Rejected:</span>{' '}
          {agent.rejectionReason}
        </p>
      )}
    </article>
  );
}
