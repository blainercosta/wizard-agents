'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import UpvoteButton from './upvote-button';

type Supporter = {
  username: string;
  avatarUrl: string | null;
};

type Props = {
  targetType: 'official' | 'community';
  targetId: string;
  initialCount: number;
  initialVoted: boolean;
  initialIsPublic: boolean;
  isAuthenticated: boolean;
  initialSupporters: Supporter[];
  currentUser: { username: string; avatarUrl: string | null } | null;
};

export default function UpvoteSection({
  targetType,
  targetId,
  initialCount,
  initialVoted,
  initialIsPublic,
  isAuthenticated,
  initialSupporters,
  currentUser,
}: Props) {
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [supporters, setSupporters] = useState<Supporter[]>(initialSupporters);
  const [pending, startTransition] = useTransition();
  const supabase = createClient();

  async function togglePublic() {
    if (!isAuthenticated || !currentUser) return;

    const next = !isPublic;
    setIsPublic(next);

    setSupporters((prev) => {
      const filtered = prev.filter((s) => s.username !== currentUser.username);
      return next ? [currentUser, ...filtered] : filtered;
    });

    startTransition(async () => {
      const { error } = await supabase.rpc('cast_vote', {
        p_target_type: targetType,
        p_target_id: targetId,
        p_is_public: next,
      });
      if (error) {
        setIsPublic(!next);
        setSupporters(initialSupporters);
        console.error('Failed to update public status:', error.message);
      }
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 flex-wrap">
        <UpvoteButton
          targetType={targetType}
          targetId={targetId}
          initialCount={initialCount}
          initialVoted={initialVoted}
          isAuthenticated={isAuthenticated}
          size="md"
        />

        {isAuthenticated && currentUser && initialVoted && (
          <label className="inline-flex items-start gap-2 text-[13px] text-text-secondary cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={togglePublic}
              disabled={pending}
              className="mt-0.5 w-4 h-4 rounded border border-border bg-white/[0.02] accent-accent-lilac"
            />
            <span>
              Show my <span className="text-text-primary">@{currentUser.username}</span> publicly
              <span className="block text-xs text-text-muted mt-0.5">
                Others will see you endorsed this agent.
              </span>
            </span>
          </label>
        )}
      </div>

      {supporters.length > 0 && (
        <div>
          <div className="text-text-muted text-xs mb-2">
            Supporters ({supporters.length})
          </div>
          <div className="flex flex-wrap gap-1.5">
            {supporters.map((s) => (
              <a
                key={s.username}
                href={`https://github.com/${s.username}`}
                target="_blank"
                rel="noopener noreferrer"
                title={`@${s.username}`}
                className="inline-flex items-center gap-1.5 h-7 pl-1 pr-2.5 rounded-full bg-white/[0.04] border border-border-subtle hover:bg-white/[0.08] transition-colors"
              >
                {s.avatarUrl && (
                  <Image
                    src={s.avatarUrl}
                    alt={s.username}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                )}
                <span className="text-xs text-text-secondary">
                  @{s.username}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
