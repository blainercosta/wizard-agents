import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { redirect } from 'next/navigation';
import { Header, Footer, LinkButton } from '@/components';
import { createClient } from '@/lib/supabase/server';
import { getUserSubmissions } from '@/lib/supabase/community';
import { formatDate, getCategoryLabel } from '@/lib/utils';
import type { CommunityAgent } from '@/types/agent';

export const metadata = {
  title: 'Your submissions - Wizard Agents',
};

export default async function SubmissionsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/submit/login-required');
  }

  const submissions = await getUserSubmissions(supabase, user.id);

  const pending = submissions.filter((s) => s.status === 'pending').length;
  const approved = submissions.filter((s) => s.status === 'approved').length;
  const rejected = submissions.filter((s) => s.status === 'rejected').length;

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

          <div className="flex flex-wrap items-end justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-4xl font-medium text-text-primary tracking-display leading-tight">
              Your submissions
            </h1>
            <LinkButton href="/submit" variant="primary" size="md">
              Submit another →
            </LinkButton>
          </div>

          {submissions.length > 0 && (
            <p className="text-[13px] text-text-muted mb-10">
              <span className="tabular-nums">{pending}</span> pending ·{' '}
              <span className="tabular-nums">{approved}</span> approved ·{' '}
              <span className="tabular-nums">{rejected}</span> rejected
            </p>
          )}

          {submissions.length === 0 ? (
            <div className="bg-white/[0.02] border border-border rounded-lg p-10 text-center">
              <p className="text-text-primary text-[15px] mb-2">
                You haven&apos;t submitted anything yet.
              </p>
              <p className="text-text-muted text-[13px] mb-6">
                Share a prompt you use with Claude Code.
              </p>
              <LinkButton href="/submit" variant="primary" size="md">
                Submit your first agent
              </LinkButton>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => (
                <SubmissionItem key={s.id} submission={s} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

function SubmissionItem({ submission: s }: { submission: CommunityAgent }) {
  const statusLabel =
    s.status === 'pending'
      ? 'In review'
      : s.status === 'approved'
        ? 'Approved'
        : 'Rejected';

  const statusClass =
    s.status === 'pending'
      ? 'text-text-secondary border-border'
      : s.status === 'approved'
        ? 'text-accent-neon border-accent-neon/40'
        : 'text-red-400 border-red-500/40';

  const titleEl =
    s.status === 'approved' ? (
      <Link
        href={`/agent/${s.slug}`}
        className="text-[15px] font-semibold text-text-primary tracking-tight hover:text-accent-lilac transition-colors"
      >
        {s.name}
      </Link>
    ) : (
      <span className="text-[15px] font-semibold text-text-primary tracking-tight">
        {s.name}
      </span>
    );

  return (
    <article className="bg-white/[0.02] border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            {titleEl}
            <span
              className={`inline-flex items-center h-5 px-2 text-[10px] font-medium border rounded-full ${statusClass}`}
            >
              {statusLabel}
            </span>
            <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-lilac border border-accent-lilac/40 rounded-full">
              {getCategoryLabel(s.category, s.categoryLabel)}
            </span>
          </div>
          <div className="text-xs text-text-muted">
            /{s.slug} ·{' '}
            {s.status === 'pending'
              ? `submitted ${formatDate(s.created)}`
              : `decided ${formatDate(s.updated)}`}
          </div>
        </div>
      </div>

      <p className="text-[13px] leading-relaxed text-text-secondary">
        {s.description}
      </p>

      {s.status === 'pending' && (
        <p className="mt-3 text-xs text-text-muted">
          We usually decide within 48 hours. You&apos;ll get a GitHub
          notification when there&apos;s an update.
        </p>
      )}

      {s.status === 'rejected' && s.rejectionReason && (
        <p className="mt-3 text-[13px] text-text-secondary bg-red-500/5 border border-red-500/20 rounded-md px-3 py-2">
          <span className="text-red-400 font-medium">Reviewer note:</span>{' '}
          {s.rejectionReason}
        </p>
      )}
    </article>
  );
}
