'use client';

import { useState, useTransition } from 'react';
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

  const padding = size === 'md' ? 'px-4 py-2' : 'px-3 py-1.5';
  const textSize = size === 'md' ? 'text-sm' : 'text-xs';

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={voted}
      aria-label={voted ? 'Remove upvote' : 'Upvote'}
      className={`inline-flex items-center gap-2 border-2 ${padding} ${textSize} font-mono font-bold transition-all disabled:opacity-70 ${
        voted
          ? 'bg-accent-neon text-background-primary border-accent-neon'
          : 'bg-transparent text-text-secondary border-border hover:border-accent-neon hover:text-text-primary'
      }`}
    >
      <span aria-hidden>{voted ? '▲' : '△'}</span>
      <span>{count}</span>
    </button>
  );
}
