'use client';

import { useState, useTransition } from 'react';
import { ExternalLink, Trash2, Copy, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { deletePrompt } from '@/lib/supabase/prompts';
import { copyToClipboard, formatDate } from '@/lib/utils';
import type { Prompt } from '@/types/prompt';

type Props = {
  prompt: Prompt & { id: string };
};

export default function PromptAdminCard({ prompt }: Props) {
  const [removed, setRemoved] = useState(false);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  const url = `https://prompts.blainercosta.com/${prompt.slug}`;

  async function handleCopy() {
    const ok = await copyToClipboard(url);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  }

  function handleDelete() {
    if (!confirm(`Delete "${prompt.title}"?`)) return;
    startTransition(async () => {
      try {
        await deletePrompt(supabase, prompt.id);
        setRemoved(true);
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete');
      }
    });
  }

  if (removed) return null;

  return (
    <article className="bg-white/[0.02] border border-border rounded-lg p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-[15px] font-semibold text-text-primary tracking-tight">
              {prompt.title}
            </h3>
            <span className="inline-flex items-center h-5 px-2 text-[11px] font-medium text-text-muted bg-white/[0.04] rounded-full font-mono">
              {prompt.slug}
            </span>
          </div>
          <p className="text-[13px] text-text-secondary mb-2 line-clamp-2">
            {prompt.description}
          </p>
          <p className="text-[11px] text-text-muted">
            Criado em {formatDate(prompt.publishedAt)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? 'Copiado' : 'Copiar URL'}
          </button>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-text-secondary bg-white/[0.02] border border-border hover:bg-white/[0.05] hover:text-text-primary transition-colors"
            aria-label="Open"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            className="inline-flex items-center justify-center w-8 h-8 rounded-full text-text-muted hover:text-red-400 hover:border-red-500/40 bg-white/[0.02] border border-border transition-colors disabled:opacity-60"
            aria-label="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
}
