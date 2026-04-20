'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Check, Heart, MessageCircleReply, Trash2, X } from 'lucide-react';
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

  const totalCount = countAll(comments);
  const gated = !isAuthenticated && totalCount > VISIBLE_WHEN_GATED;
  const visibleTopLevel = gated
    ? comments.slice(0, VISIBLE_WHEN_GATED)
    : comments;
  const hiddenCount = gated ? totalCount - countAll(visibleTopLevel) : 0;

  async function postTopLevel(e: React.FormEvent) {
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
          p_parent_id: null,
        }
      );

      if (rpcError || !newId) {
        setError(rpcError?.message ?? 'Failed to post comment.');
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const optimistic: AgentComment = buildOptimistic(newId, user, body.trim());
      setComments((prev) => [optimistic, ...prev]);
      setBody('');
    });
  }

  async function postReply(parentId: string, replyBody: string) {
    return new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const { data: newId, error: rpcError } = await supabase.rpc(
          'post_comment',
          {
            p_agent_id: agentId,
            p_body: replyBody,
            p_kind: 'comment',
            p_parent_id: parentId,
          }
        );

        if (rpcError || !newId) {
          console.error('Reply failed:', rpcError?.message);
          resolve(false);
          return;
        }

        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          resolve(false);
          return;
        }

        const optimistic: AgentComment = buildOptimistic(
          newId,
          user,
          replyBody,
          parentId
        );
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId ? { ...c, replies: [...c.replies, optimistic] } : c
          )
        );
        resolve(true);
      });
    });
  }

  function handleDelete(id: string, parentId: string | null) {
    startTransition(async () => {
      const { error: rpcError } = await supabase.rpc('delete_comment', {
        p_comment_id: id,
      });
      if (rpcError) {
        console.error('Delete failed:', rpcError.message);
        return;
      }
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies.filter((r) => r.id !== id) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== id));
      }
    });
  }

  function handleResolve(id: string, reply: string) {
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

  function handleToggleLike(id: string, parentId: string | null) {
    if (!isAuthenticated) return;

    const flip = (c: AgentComment): AgentComment =>
      c.id === id
        ? {
            ...c,
            likedByMe: !c.likedByMe,
            likeCount: c.likeCount + (c.likedByMe ? -1 : 1),
          }
        : c;

    // Optimistic
    if (parentId) {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId
            ? { ...c, replies: c.replies.map(flip) }
            : c
        )
      );
    } else {
      setComments((prev) => prev.map(flip));
    }

    // Detect desired state AFTER flip (easier to reason)
    const target =
      parentId
        ? comments
            .find((c) => c.id === parentId)
            ?.replies.find((r) => r.id === id)
        : comments.find((c) => c.id === id);
    const wasLiked = target?.likedByMe ?? false;
    const shouldLike = !wasLiked;

    startTransition(async () => {
      const { error: rpcError } = shouldLike
        ? await supabase.rpc('add_comment_like', { p_comment_id: id })
        : await supabase.rpc('remove_comment_like', { p_comment_id: id });

      if (rpcError) {
        // Revert
        if (parentId) {
          setComments((prev) =>
            prev.map((c) =>
              c.id === parentId
                ? { ...c, replies: c.replies.map(flip) }
                : c
            )
          );
        } else {
          setComments((prev) => prev.map(flip));
        }
        console.error('Like failed:', rpcError.message);
      }
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
        <form onSubmit={postTopLevel} className="mb-6">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Thank the author, share a critique, suggest an improvement…"
            rows={3}
            maxLength={2000}
            className="w-full bg-white/[0.02] border border-border rounded-lg px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-lilac focus:shadow-focus resize-none"
          />
          {error && <div className="mt-2 text-xs text-red-400">{error}</div>}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-muted tabular-nums">
              {body.length}/2000
            </span>
            <button
              type="submit"
              disabled={pending || !body.trim()}
              className="inline-flex items-center h-8 px-3 text-[13px] font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
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

      {visibleTopLevel.length === 0 ? (
        <div className="text-[13px] text-text-muted py-6 text-center">
          No comments yet. Be the first to share a thought.
        </div>
      ) : (
        <ol className="space-y-6">
          {visibleTopLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              isAuthenticated={isAuthenticated}
              isReply={false}
              canDelete={currentUserId === c.userId}
              canResolve={
                !!agentOwnerId &&
                currentUserId === agentOwnerId &&
                !c.resolved
              }
              pending={pending}
              currentUserId={currentUserId}
              onDelete={() => handleDelete(c.id, null)}
              onResolve={(reply) => handleResolve(c.id, reply)}
              onToggleLike={() => handleToggleLike(c.id, null)}
              onReply={(text) => postReply(c.id, text)}
              onDeleteReply={(replyId) => handleDelete(replyId, c.id)}
              onToggleLikeReply={(replyId) =>
                handleToggleLike(replyId, c.id)
              }
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

function countAll(list: AgentComment[]): number {
  let n = 0;
  for (const c of list) n += 1 + c.replies.length;
  return n;
}

function buildOptimistic(
  id: string,
  user: { id: string; user_metadata?: Record<string, unknown> },
  body: string,
  parentId: string | null = null
): AgentComment {
  return {
    id,
    userId: user.id,
    username:
      (user.user_metadata?.user_name as string) ??
      (user.user_metadata?.preferred_username as string) ??
      'you',
    avatarUrl: (user.user_metadata?.avatar_url as string) ?? null,
    body,
    kind: 'comment',
    resolved: false,
    resolvedReply: null,
    resolvedAt: null,
    createdAt: new Date().toISOString(),
    parentId,
    likeCount: 0,
    likedByMe: false,
    replies: [],
  };
}

function Avatar({
  src,
  alt,
  size = 28,
}: {
  src: string | null;
  alt: string;
  size?: number;
}) {
  return (
    <div
      className="relative shrink-0 overflow-hidden rounded-full border border-border bg-white/[0.04]"
      style={{ width: size, height: size }}
    >
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={`${size}px`}
          className="object-cover"
          unoptimized
        />
      )}
    </div>
  );
}

type CommentItemProps = {
  comment: AgentComment;
  isAuthenticated: boolean;
  isReply: boolean;
  canDelete: boolean;
  canResolve: boolean;
  pending: boolean;
  currentUserId: string | null;
  onDelete: () => void;
  onResolve?: (reply: string) => void;
  onToggleLike: () => void;
  onReply?: (text: string) => Promise<boolean>;
  onDeleteReply?: (replyId: string) => void;
  onToggleLikeReply?: (replyId: string) => void;
};

function CommentItem({
  comment,
  isAuthenticated,
  isReply,
  canDelete,
  canResolve,
  pending,
  currentUserId,
  onDelete,
  onResolve,
  onToggleLike,
  onReply,
  onDeleteReply,
  onToggleLikeReply,
}: CommentItemProps) {
  const [showResolve, setShowResolve] = useState(false);
  const [resolveReply, setResolveReply] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [replyPending, setReplyPending] = useState(false);

  function submitResolve() {
    if (!resolveReply.trim() || !onResolve) return;
    onResolve(resolveReply.trim());
    setShowResolve(false);
    setResolveReply('');
  }

  async function submitReply() {
    if (!replyBody.trim() || !onReply) return;
    setReplyPending(true);
    const ok = await onReply(replyBody.trim());
    setReplyPending(false);
    if (ok) {
      setShowReply(false);
      setReplyBody('');
    }
  }

  const avatarSize = isReply ? 24 : 28;

  return (
    <li className="flex gap-3">
      <Avatar src={comment.avatarUrl} alt={comment.username} size={avatarSize} />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1 flex-wrap">
          <Link
            href={`/u/${comment.username}`}
            className="text-[13px] font-medium text-text-primary hover:text-accent-lilac underline underline-offset-2 decoration-border-subtle hover:decoration-accent-lilac/60 transition-colors"
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

        <div className="flex items-center gap-1 mt-2 flex-wrap">
          <button
            onClick={onToggleLike}
            disabled={!isAuthenticated || pending}
            title={isAuthenticated ? undefined : 'Sign in to like'}
            className={`inline-flex items-center gap-1 h-6 px-2 text-xs font-medium rounded-full transition-colors disabled:cursor-not-allowed ${
              comment.likedByMe
                ? 'text-accent-hover bg-accent-brand/10'
                : 'text-text-muted hover:text-text-primary hover:bg-white/[0.04]'
            } ${!isAuthenticated ? 'opacity-70' : ''}`}
          >
            <Heart
              className="w-3 h-3"
              strokeWidth={2.25}
              fill={comment.likedByMe ? 'currentColor' : 'none'}
            />
            <span className="tabular-nums">{comment.likeCount}</span>
          </button>

          {!isReply && isAuthenticated && (
            <button
              onClick={() => setShowReply((v) => !v)}
              className="inline-flex items-center gap-1 h-6 px-2 text-xs font-medium text-text-muted hover:text-text-primary hover:bg-white/[0.04] rounded-full transition-colors"
            >
              <MessageCircleReply className="w-3 h-3" strokeWidth={2} />
              Reply
            </button>
          )}

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
              value={resolveReply}
              onChange={(e) => setResolveReply(e.target.value)}
              placeholder="e.g. Uploaded v1.1 with the fix mentioned above."
              rows={2}
              maxLength={500}
              className="w-full bg-white/[0.02] border border-border rounded-md px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-lilac focus:shadow-focus resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={submitResolve}
                disabled={pending || !resolveReply.trim()}
                className="inline-flex items-center gap-1 h-7 px-3 text-xs font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
              >
                <Check className="w-3 h-3" strokeWidth={2.5} />
                Confirm resolve
              </button>
              <button
                onClick={() => {
                  setShowResolve(false);
                  setResolveReply('');
                }}
                className="inline-flex items-center gap-1 h-7 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-full transition-colors"
              >
                <X className="w-3 h-3" strokeWidth={2} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {showReply && (
          <div className="mt-3 bg-white/[0.02] border border-border rounded-lg p-3">
            <textarea
              value={replyBody}
              onChange={(e) => setReplyBody(e.target.value)}
              placeholder={`Reply to @${comment.username}…`}
              rows={2}
              maxLength={1000}
              className="w-full bg-white/[0.02] border border-border rounded-md px-3 py-2 text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-lilac focus:shadow-focus resize-none"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={submitReply}
                disabled={replyPending || !replyBody.trim()}
                className="inline-flex items-center h-7 px-3 text-xs font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
              >
                {replyPending ? 'Posting…' : 'Post reply'}
              </button>
              <button
                onClick={() => {
                  setShowReply(false);
                  setReplyBody('');
                }}
                className="inline-flex items-center h-7 px-3 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-white/[0.04] rounded-full transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {!isReply && comment.replies.length > 0 && (
          <ol className="mt-4 pl-3 border-l border-border-subtle space-y-4">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                isAuthenticated={isAuthenticated}
                isReply={true}
                canDelete={currentUserId === reply.userId}
                canResolve={false}
                pending={pending}
                currentUserId={currentUserId}
                onDelete={() =>
                  onDeleteReply && onDeleteReply(reply.id)
                }
                onToggleLike={() =>
                  onToggleLikeReply && onToggleLikeReply(reply.id)
                }
              />
            ))}
          </ol>
        )}
      </div>
    </li>
  );
}
