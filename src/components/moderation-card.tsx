'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getCategoryLabel } from '@/lib/utils';
import { isDefaultCategory, type CommunityAgent } from '@/types/agent';
import MarkdownPreview from './markdown-preview';

type Props = {
  agent: CommunityAgent;
};

export default function ModerationCard({ agent }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [pending, startTransition] = useTransition();
  const [showReject, setShowReject] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleApprove() {
    setError(null);
    startTransition(async () => {
      const { error: rpcError } = await supabase.rpc('approve_community_agent', {
        p_id: agent.id,
      });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      router.refresh();
    });
  }

  function handleReject() {
    if (!reason.trim()) {
      setError('Provide a reason for rejection.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const { error: rpcError } = await supabase.rpc('reject_community_agent', {
        p_id: agent.id,
        p_reason: reason.trim(),
      });
      if (rpcError) {
        setError(rpcError.message);
        return;
      }
      router.refresh();
    });
  }

  return (
    <article className="bg-white/[0.02] border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[15px] font-semibold text-text-primary tracking-tight">
              {agent.name}
            </h3>
            <span className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-muted bg-white/[0.04] rounded-full">
              v{agent.version}
            </span>
            <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-lilac border border-accent-lilac/40 rounded-full">
              {getCategoryLabel(agent.category, agent.categoryLabel)}
            </span>
            {!isDefaultCategory(agent.category) && (
              <span
                className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-hover bg-accent-brand/15 border border-accent-brand/40 rounded-full"
                title="Author proposed a new category — approving the agent approves the category."
              >
                New category
              </span>
            )}
          </div>
          <div className="text-xs text-text-muted">
            /{agent.slug} · submitted {formatDate(agent.created)}
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

      <p className="text-[13px] leading-relaxed text-text-secondary mb-4">
        {agent.description}
      </p>

      {agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {agent.tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-secondary bg-white/[0.04] rounded-full"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="bg-background-primary border border-border-subtle rounded-md mb-4 max-h-[280px] overflow-y-auto">
        <div className="sticky top-0 bg-background-primary/95 backdrop-blur border-b border-border-subtle px-4 py-2">
          <span className="text-text-muted text-xs font-mono">
            {agent.slug}.md
          </span>
        </div>
        <div className="p-4">
          <MarkdownPreview content={agent.content} />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2 mb-3">
          {error}
        </div>
      )}

      {showReject ? (
        <div className="space-y-3">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for rejection (shown to author)"
            rows={3}
            className="w-full bg-white/[0.02] border border-border rounded-md px-3 py-2 text-[13px] text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-accent-lilac"
          />
          <div className="flex gap-2">
            <button
              onClick={handleReject}
              disabled={pending}
              className="inline-flex items-center h-8 px-3 text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-full transition-colors disabled:opacity-60"
            >
              {pending ? 'Rejecting...' : 'Confirm reject'}
            </button>
            <button
              onClick={() => {
                setShowReject(false);
                setReason('');
                setError(null);
              }}
              className="inline-flex items-center h-8 px-3 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleApprove}
            disabled={pending}
            className="inline-flex items-center h-8 px-3 text-[13px] font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
          >
            {pending ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={pending}
            className="inline-flex items-center h-8 px-3 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:border-red-500/40 hover:text-red-400 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
