'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isCurated, type CommunityAgent } from '@/types/agent';
import {
  getCategoryLabel,
  copyToClipboard,
  downloadFile,
  isNew,
  isRecentlyUpdated,
  agentHref,
} from '@/lib/utils';
import UpvoteButton from './upvote-button';
import BookmarkButton from './bookmark-button';
import VerifiedBadge from './verified-badge';

interface AgentCardProps {
  agent: CommunityAgent;
  voteCount: number;
  hasVoted: boolean;
  hasBookmarked: boolean;
  isAuthenticated: boolean;
  fromCategory?: string;
}

export default function AgentCard({
  agent,
  voteCount,
  hasVoted,
  hasBookmarked,
  isAuthenticated,
  fromCategory,
}: AgentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const success = await copyToClipboard(agent.rawContent);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    downloadFile(agent.rawContent, `${agent.slug}.md`);
  };

  const tags = agent.tags ?? [];
  const hiddenTags = tags.length > 3 ? tags.slice(3) : [];
  const curated = isCurated(agent);
  const showAuthor = !curated;

  return (
    <Link href={agentHref(agent, fromCategory)} className="block group">
      <article className="relative h-full flex flex-col p-5 bg-white/[0.02] border border-border rounded-lg transition-colors group-hover:bg-white/[0.04] group-hover:border-border-solid">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <h3 className="text-[15px] font-semibold text-text-primary tracking-tight truncate">
              {agent.name}
            </h3>
            {curated && (
              <VerifiedBadge className="w-4 h-4 text-accent-hover shrink-0" />
            )}
            {isNew(agent.created) && (
              <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-hover bg-accent-brand/15 border border-accent-brand/40 rounded-full">
                New
              </span>
            )}
            {!isNew(agent.created) && isRecentlyUpdated(agent) && (
              <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-text-secondary bg-white/[0.04] border border-border-subtle rounded-full">
                Updated
              </span>
            )}
            {showAuthor && (
              <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-lilac border border-accent-lilac/40 rounded-full">
                Community
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <BookmarkButton
              agentId={agent.id}
              initialBookmarked={hasBookmarked}
              isAuthenticated={isAuthenticated}
            />
            <UpvoteButton
              targetId={agent.id}
              initialCount={voteCount}
              initialVoted={hasVoted}
              isAuthenticated={isAuthenticated}
            />
          </div>
        </div>

        <div className="text-xs text-text-muted mb-3">
          v{agent.version} · {getCategoryLabel(agent.category, agent.categoryLabel)}
        </div>

        <p className="text-[13px] leading-relaxed text-text-secondary mb-4 line-clamp-3 flex-1">
          {agent.description}
        </p>

        {showAuthor && (
          <div
            className="flex items-center gap-2 mb-3"
            onClick={(e) => e.stopPropagation()}
          >
            {agent.author.avatarUrl && (
              <Image
                src={agent.author.avatarUrl}
                alt={agent.author.username}
                width={16}
                height={16}
                className="rounded-full border border-border"
              />
            )}
            <Link
              href={`/u/${agent.author.username}`}
              className="text-xs text-text-muted hover:text-text-primary transition-colors"
            >
              by @{agent.author.username}
            </Link>
          </div>
        )}

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-secondary bg-white/[0.04] rounded-full"
              >
                {tag}
              </span>
            ))}
            {hiddenTags.length > 0 && (
              <span
                className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-muted"
                title={`${hiddenTags.length} more tags`}
              >
                +{hiddenTags.length}
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleCopy}
            className="flex-1 inline-flex items-center justify-center h-8 px-3 text-[13px] font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-full transition-colors"
          >
            {copied ? 'Copied' : 'Copy prompt'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 inline-flex items-center justify-center h-8 px-3 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
          >
            Download
          </button>
        </div>
      </article>
    </Link>
  );
}
