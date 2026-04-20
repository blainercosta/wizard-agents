'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { ChevronUp, Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  targetType: 'official' | 'community';
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
  isAuthenticated: boolean;
  size?: 'sm' | 'md';
};

export default function UpvoteButton({
  targetType,
  targetId,
  initialCount,
  initialVoted,
  isAuthenticated,
  size = 'sm',
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pending, startTransition] = useTransition();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!showPrompt) return;
    function handleOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowPrompt(false);
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [showPrompt]);

  async function signIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowPrompt((v) => !v);
      return;
    }

    const nextVoted = !voted;
    const nextCount = count + (nextVoted ? 1 : -1);
    setVoted(nextVoted);
    setCount(nextCount);

    startTransition(async () => {
      const { error } = nextVoted
        ? await supabase.rpc('cast_vote', {
            p_target_type: targetType,
            p_target_id: targetId,
            p_is_public: false,
          })
        : await supabase.rpc('remove_vote', {
            p_target_type: targetType,
            p_target_id: targetId,
          });

      if (error) {
        setVoted(!nextVoted);
        setCount(count);
        console.error('Vote failed:', error.message);
      }
    });
  }

  const dims = size === 'md' ? 'h-9 px-3 text-sm gap-2' : 'h-7 px-2 text-xs gap-1.5';
  const iconSize = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <div ref={wrapperRef} className="relative">
      <button
        onClick={handleClick}
        disabled={pending}
        aria-pressed={voted}
        aria-label={voted ? 'Remove upvote' : 'Upvote'}
        className={`inline-flex items-center ${dims} font-medium rounded-md border transition-colors disabled:opacity-60 ${
          voted
            ? 'bg-accent-brand/15 border-accent-brand/40 text-accent-hover'
            : 'bg-white/[0.02] border-border text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
        }`}
      >
        <ChevronUp className={iconSize} strokeWidth={2.5} />
        <span className="tabular-nums">{count}</span>
      </button>

      {showPrompt && (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-full right-0 mt-2 w-[260px] bg-background-secondary border border-border rounded-md shadow-elevated p-3 z-30"
        >
          <p className="text-[13px] font-medium text-text-primary mb-1">
            Sign in to upvote
          </p>
          <p className="text-xs text-text-muted mb-3 leading-relaxed">
            We use GitHub for identity only — no emails, no spam.
          </p>
          <div className="flex gap-2">
            <button
              onClick={signIn}
              className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-md transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              Continue
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowPrompt(false);
              }}
              className="inline-flex items-center h-7 px-2.5 text-xs font-medium text-text-secondary bg-transparent hover:bg-white/[0.04] rounded-md transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
