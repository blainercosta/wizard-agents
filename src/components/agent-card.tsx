'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AgentCard as AgentCardType } from '@/types/agent';
import { getCategoryLabel, copyToClipboard, downloadFile, isNew } from '@/lib/utils';
import UpvoteButton from './upvote-button';

interface AgentCardProps {
  agent: AgentCardType;
  voteCount: number;
  hasVoted: boolean;
  isAuthenticated: boolean;
}

export default function AgentCard({
  agent,
  voteCount,
  hasVoted,
  isAuthenticated,
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

  const hiddenTags = agent.tags && agent.tags.length > 3 ? agent.tags.slice(3) : [];

  return (
    <Link href={`/agent/${agent.slug}`} className="block group">
      <article className="bg-background-secondary border-2 border-border p-5 sm:p-6 h-full flex flex-col transition-all duration-150 group-hover:border-accent-lilac group-hover:-translate-y-0.5 group-hover:shadow-[4px_4px_0_0_rgba(167,139,250,0.3)]">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-text-primary font-mono">
              {agent.name}
            </h3>
            {isNew(agent.created) && (
              <span className="px-2 py-0.5 bg-accent-neon text-background-primary text-[10px] font-mono font-bold">
                NEW
              </span>
            )}
          </div>
          <UpvoteButton
            targetType="official"
            targetId={agent.slug}
            initialCount={voteCount}
            initialVoted={hasVoted}
            isAuthenticated={isAuthenticated}
          />
        </div>

        <div className="text-xs text-text-secondary font-mono mb-3">
          v{agent.version} · {getCategoryLabel(agent.category)}
        </div>

        <p className="text-sm text-text-secondary font-mono mb-4 line-clamp-3 flex-1">
          {agent.description}
        </p>

        {agent.tags && agent.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {agent.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 bg-transparent border border-accent-lilac text-accent-lilac text-xs font-mono"
              >
                {tag}
              </span>
            ))}
            {hiddenTags.length > 0 && (
              <span
                className="text-text-muted text-xs font-mono self-center cursor-help relative group/tooltip"
                title={`${hiddenTags.length} more tags`}
              >
                +{hiddenTags.length}
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-background-tertiary border border-border text-text-secondary text-xs whitespace-nowrap opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                  {hiddenTags.length} more tags
                </span>
              </span>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-auto">
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-2 bg-accent-lilac text-white font-bold text-xs font-mono transition-all duration-150 hover:opacity-90"
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex-1 px-4 py-2 bg-transparent border border-border text-text-secondary text-xs font-mono transition-all duration-150 hover:border-accent-lilac hover:text-accent-lilac"
          >
            Download .md
          </button>
        </div>
      </article>
    </Link>
  );
}
