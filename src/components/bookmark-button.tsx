'use client';

import { useState, useTransition } from 'react';
import { Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import SignInPopover from './sign-in-popover';

type Props = {
  agentId: string;
  initialBookmarked: boolean;
  isAuthenticated: boolean;
};

export default function BookmarkButton({
  agentId,
  initialBookmarked,
  isAuthenticated,
}: Props) {
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [showPrompt, setShowPrompt] = useState(false);
  const [pending, startTransition] = useTransition();
  const supabase = createClient();

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      setShowPrompt((v) => !v);
      return;
    }

    const next = !bookmarked;
    setBookmarked(next);

    startTransition(async () => {
      const { error } = next
        ? await supabase.rpc('add_bookmark', { p_agent_id: agentId })
        : await supabase.rpc('remove_bookmark', { p_agent_id: agentId });

      if (error) {
        setBookmarked(!next);
        console.error('Bookmark failed:', error.message);
      }
    });
  }

  return (
    <div className="relative">
      <button
        onClick={handleClick}
        disabled={pending}
        aria-pressed={bookmarked}
        aria-label={bookmarked ? 'Remove from saved' : 'Save for later'}
        title={bookmarked ? 'Saved' : 'Save for later'}
        className={`inline-flex items-center justify-center h-7 w-7 rounded-md border transition-colors disabled:opacity-60 ${
          bookmarked
            ? 'bg-accent-brand/15 border-accent-brand/40 text-accent-hover'
            : 'bg-white/[0.02] border-border text-text-secondary hover:bg-white/[0.05] hover:text-text-primary'
        }`}
      >
        <Bookmark
          className="w-3.5 h-3.5"
          fill={bookmarked ? 'currentColor' : 'none'}
          strokeWidth={2}
        />
      </button>

      <SignInPopover
        open={showPrompt}
        onClose={() => setShowPrompt(false)}
        title="Sign in to save"
        description="Save agents to revisit anytime — synced to your GitHub account."
      />
    </div>
  );
}
