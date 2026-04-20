'use client';

import { useState, useTransition } from 'react';
import { ChevronUp } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  targetType: 'official' | 'community';
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
  isAuthenticated: boolean;
  size?: 'sm' | 'md';
  onRequireLogin?: () => void;
};

export default function UpvoteButton({
  targetType,
  targetId,
  initialCount,
  initialVoted,
  isAuthenticated,
  size = 'sm',
  onRequireLogin,
}: Props) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pending, startTransition] = useTransition();
  const supabase = createClient();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      if (onRequireLogin) onRequireLogin();
      else {
        await supabase.auth.signInWithOAuth({
          provider: 'github',
          options: { redirectTo: `${window.location.origin}/auth/callback` },
        });
      }
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
    <button
      onClick={toggle}
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
  );
}
