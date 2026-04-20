'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import type { AgentComment } from '@/lib/supabase/comments';
import SignInWithGithubButton from './sign-in-github-button';

const VISIBLE_WHEN_GATED = 2;

type Props = {
  agentId: string;
  agentSlug: string;
  agentOwnerId: string | null;
  initialComments: AgentComment[];
  isAuthenticated: boolean;
  currentUserId: string | null;
};

export default function CommentThread({
  agentId,
  agentSlug,
  agentOwnerId,
  initialComments,
  isAuthenticated,
  currentUserId,
}: Props) {
  const [comments, setComments] = useState<AgentComment[]>(initialComments);
  const [body, setBody] = useState('');
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const totalCount = comments.length;
  const gated = !isAuthenticated && totalCount > VISIBLE_WHEN_GATED;
  const visibleComments = gated
    ? comments.slice(0, VISIBLE_WHEN_GATED)
    : comments;
  const hiddenCount = gated ? totalCount - VISIBLE_WHEN_GATED : 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!body.trim()) return;
    if (body.length > 2000) {
      setError('Comments must be 2000 characters or less.');
      return;
    }

    startTransition(async () => {
      const { data: newId, error: rpcError } = await supabase.rpc(
        'post_comment',
        {
          p_agent_id: agentId,
          p_body: body.trim(),
          p_kind: 'comment',
        }
      );

      if (rpcError || !newId) {
        setError(rpcError?.message ?? 'Failed to post comment.');
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const optimistic: AgentComment = {
        id: newId,
        userId: user.id,
        username:
          (user.user_metadata?.user_name as string) ??
          (user.user_metadata?.preferred_username as string) ??
          'you',
        avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
        body: body.trim(),
        kind: 'comment',
        resolved: false,
        resolvedReply: null,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
      };
      setComments((prev) => [optimistic, ...prev]);
      setBody('');
    });
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      const { error: rpcError } = await supabase.rpc('delete_comment', {
        p_comment_id: id,
      });
      if (rpcError) {
        console.error('Delete comment failed:', rpcError.message);
        return;
      }
      setComments((prev) => prev.filter((c) => c.id !== id));
    });
  }

  async function handleResolve(id: string, reply: string) {
    startTransition(async () => {
      const { error: rpcError } = await supabase.rpc('resolve_comment', {
        p_comment_id: id,
        p_reply: reply,
      });
      if (rpcError) {
        console.error('Resolve failed:', rpcError.message);
        return;
      }
      setComments((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                resolved: true,
                resolvedReply: reply,
                resolvedAt: new Date().toISOString(),
              }
            : c
        )
      );
    });
  }

  return (
    <section>
      <div className="flex items-baseline justify-between gap-4 mb-5">
        <h2 className="text-[15px] font-semibold text-text-primary tracking-tight">
          Activity
        </h2>
        <span className="text-xs text-text-muted tabular-nums">
          {totalCount} {totalCount === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Thank the author, share a critique, suggest an improvement…"
            rows={3}
            maxLength={2000}
            className="w-full bg-white/[0.02] border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-accent-lilac resize-none"
          />
          {error && (
            <div className="mt-2 text-xs text-red-400">{error}</div>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-muted tabular-nums">
              {body.length}/2000
            </span>
            <button
              type="submit"
              disabled={pending || !body.trim()}
              className="inline-flex items-center h-8 px-3 text-[13px] font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
            >
              {pending ? 'Posting…' : 'Post'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white/[0.02] border border-border rounded-lg p-4 mb-6 text-center">
          <p className="text-[13px] text-text-muted mb-3">
            Sign in to join the conversation.
          </p>
          <SignInWithGithubButton next={`/agent/${agentSlug}`} />
        </div>
      )}

      {visibleComments.length === 0 ? (
        <div className="text-[13px] text-text-muted py-6 text-center">
          No comments yet. Be the first to share a thought.
        </div>
      ) : (
        <ol className="space-y-4">
          {visibleComments.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              canDelete={currentUserId === c.userId}
              canResolve={
                !!agentOwnerId &&
                currentUserId === agentOwnerId &&
                !c.resolved
              }
              pending={pending}
              onDelete={() => handleDelete(c.id)}
              onResolve={(reply) => handleResolve(c.id, reply)}
            />
          ))}
        </ol>
      )}

      {gated && (
        <div className="mt-4 bg-background-primary border border-border rounded-lg p-6 text-center">
          <p className="text-[14px] text-text-primary font-medium mb-1">
            Sign in to see the full conversation
          </p>
          <p className="text-[13px] text-text-muted mb-4 max-w-xs mx-auto leading-relaxed">
            {hiddenCount} more {hiddenCount === 1 ? 'comment is' : 'comments are'}{' '}
            visible to signed-in readers.
          </p>
          <SignInWithGithubButton next={`/agent/${agentSlug}`} />
        </div>
      )}
    </section>
  );
}

function CommentItem({
  comment,
  canDelete,
  canResolve,
  pending,
  onDelete,
  onResolve,
}: {
  comment: AgentComment;
  canDelete: boolean;
  canResolve: boolean;
  pending: boolean;
  onDelete: () => void;
  onResolve: (reply: string) => void;
}) {
  const [showResolve, setShowResolve] = useState(false);
  const [reply, setReply] = useState('');

  function submitResolve() {
    if (!reply.trim()) return;
    onResolve(reply.trim());
    setShowResolve(false);
    setReply('');
  }

  return (
    <li className="flex gap-3">
      {comment.avatarUrl ? (
        <Image
          src={comment.avatarUrl}
          alt={comment.username}
          width={28}
          height={28}
          className="rounded-full border border-border shrink-0"
        />
      ) : (
        <div className="w-7 h-7 rounded-full bg-white/[0.04] shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <Link
            href={`/u/${comment.username}`}
            className="text-[13px] font-medium text-text-primary hover:text-accent-lilac transition-colors"
          >
            @{comment.username}
          </Link>
          <span className="text-xs text-text-muted">
            {formatDate(comment.createdAt)}
          </span>
          {comment.resolved && (
            <span className="inline-flex items-center gap-1 h-5 px-2 text-[10px] font-medium text-accent-neon border border-accent-neon/40 rounded-full">
              <Check className="w-3 h-3" strokeWidth={2.5} />
              Resolved
            </span>
          )}
        </div>

        <p className="text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap break-words">
          {comment.body}
        </p>

        {comment.resolved && comment.resolvedReply && (
          <div className="mt-3 pl-3 border-l-2 border-accent-neon/40 bg-accent-neon/5 rounded-r-md px-3 py-2">
            <div className="text-xs text-text-muted mb-1">
              Author reply
              {comment.resolvedAt && (
                <span> · {formatDate(comment.resolvedAt)}</span>
              )}
            </div>
            <p className="text-[13px] leading-relaxed text-text-secondary whitespace-pre-wrap">
              {comment.resolvedReply}
            </p>
          </div>
        )}

        <div className="flex items-center gap-2 mt-2">
          {canResolve && !showResolve && (
            <button
              onClick={() => setShowResolve(true)}
              className="inline-flex items-center gap-1 h-6 px-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-full transition-colors"
            >
              <Check className="w-3 h-3" strokeWidth={2.5} />
              Resolve
            </button>
          )}
          {canDelete && (
            <button
              onClick={onDelete}
              disabled={pending}
              className="inline-flex items-center gap-1 h-6 px-2 text-xs font-medium text-text-muted hover:text-red-400 hover:bg-red-500/5 rounded-full transition-colors disabled:opacity-60"
            >
              <Trash2 className="w-3 h-3" strokeWidth={2} />
              Delete
            </button>
          )}
        </div>

        {showResolve && (
          <div className="mt-3 bg-white/[0.02] border border-border rounded-lg p-3">
            <div className="text-xs text-text-muted mb-2">
              Describe how this was resolved. Required.
            </div>
            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="e.g. Uploaded v1.1 with the fix mentioned above."
              rows={2}
              maxLength={500}
              className="w-full bg-white/[0.02] border border-border rounded-md px-3 py-2 text-[13px] text-text-primary placeholder:text-text-subtle focus:outline-none focus:border-accent-lilac resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={submitResolve}
                disabled={pending || !reply.trim()}
                className="inline-flex items-center gap-1 h-7 px-3 text-xs font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
              >
                <Check className="w-3 h-3" strokeWidth={2.5} />
                Confirm resolve
              </button>
              <button
                onClick={() => {
                  setShowResolve(false);
                  setReply('');
                }}
                className="inline-flex items-center gap-1 h-7 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-full transition-colors"
              >
                <X className="w-3 h-3" strokeWidth={2} />
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </li>
  );
}
