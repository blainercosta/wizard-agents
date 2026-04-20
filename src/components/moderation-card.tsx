'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import { formatDate, getCategoryLabel } from '@/lib/utils';
import type { CommunityAgent } from '@/types/agent';
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
    <article className="border-2 border-border bg-background-secondary p-6">
      <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h3 className="font-mono text-base text-text-primary font-bold">
              {agent.name}
            </h3>
            <span className="px-2 py-0.5 bg-background-tertiary text-text-muted text-xs font-mono">
              v{agent.version}
            </span>
            <span className="px-2 py-0.5 border border-accent-lilac text-accent-lilac text-[10px] font-mono font-bold">
              {getCategoryLabel(agent.category).toUpperCase()}
            </span>
          </div>
          <div className="text-xs text-text-muted font-mono">
            /{agent.slug} · submitted {formatDate(agent.created)}
          </div>
        </div>
        <a
          href={`https://github.com/${agent.author.username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 border border-border px-2 py-1 hover:border-accent-lilac transition-colors"
        >
          {agent.author.avatarUrl && (
            <Image
              src={agent.author.avatarUrl}
              alt={agent.author.username}
              width={18}
              height={18}
              className="border border-border"
            />
          )}
          <span className="font-mono text-xs text-text-secondary">
            @{agent.author.username}
          </span>
        </a>
      </div>

      <p className="text-sm font-mono text-text-secondary mb-4">
        {agent.description}
      </p>

      {agent.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {agent.tags.map((t) => (
            <span
              key={t}
              className="px-2 py-1 border border-accent-lilac text-accent-lilac text-xs font-mono"
            >
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="border-2 border-border bg-background-primary mb-4 max-h-[300px] overflow-y-auto">
        <div className="border-b-2 border-border px-4 py-2">
          <span className="text-text-muted text-xs font-mono">
            {agent.slug}.md
          </span>
        </div>
        <div className="p-4">
          <MarkdownPreview content={agent.content} />
        </div>
      </div>

      {error && (
        <div className="border-2 border-red-500 bg-red-500/10 text-red-400 px-3 py-2 font-mono text-xs mb-4">
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
            className="w-full bg-background-tertiary border-2 border-border px-3 py-2 font-mono text-sm text-text-primary focus:outline-none focus:border-accent-lilac"
          />
          <div className="flex gap-3">
            <button
              onClick={handleReject}
              disabled={pending}
              className="px-4 py-2 bg-red-500 text-white font-mono font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {pending ? 'Rejecting...' : 'Confirm reject'}
            </button>
            <button
              onClick={() => {
                setShowReject(false);
                setReason('');
                setError(null);
              }}
              className="px-4 py-2 border-2 border-border text-text-secondary font-mono text-xs hover:border-accent-neon transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleApprove}
            disabled={pending}
            className="px-4 py-2 bg-accent-neon text-background-primary font-mono font-bold text-xs hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {pending ? 'Approving...' : 'Approve'}
          </button>
          <button
            onClick={() => setShowReject(true)}
            disabled={pending}
            className="px-4 py-2 border-2 border-border text-text-secondary font-mono text-xs hover:border-red-500 hover:text-red-400 transition-colors"
          >
            Reject
          </button>
        </div>
      )}
    </article>
  );
}
