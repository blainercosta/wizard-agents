'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { track } from '@/lib/analytics';
import SuccessModal from './success-modal';
import type { PromptFormat } from '@/types/prompt';

type Props = {
  slug: string;
  content: string;
  format: PromptFormat;
};

function formatContent(content: string, format: PromptFormat, slug: string): string {
  if (format !== 'json') return content;
  try {
    return JSON.stringify(JSON.parse(content), null, 2);
  } catch {
    track('prompt_copy_failed', {
      slug,
      reason: 'invalid_json',
      product: 'prompts',
    });
    return content;
  }
}

async function writeToClipboard(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.top = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    // execCommand is deprecated but still broadly supported for clipboard fallback.
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

export default function CopyButton({ slug, content, format }: Props) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (pending) return;
    setPending(true);
    setFallbackMessage(null);

    const text = formatContent(content, format, slug);
    const ok = await writeToClipboard(text);

    if (!ok) {
      setFallbackMessage(
        'Toque e segure no bloco acima pra copiar manualmente.'
      );
      track('prompt_copy_failed', {
        slug,
        reason: 'clipboard_unavailable',
        product: 'prompts',
      });
      setPending(false);
      return;
    }

    setCopied(true);
    setShowModal(true);
    track('prompt_copied', { slug, format, product: 'prompts' });
    setTimeout(() => setCopied(false), 2000);

    try {
      const res = await fetch(`/api/prompts/${encodeURIComponent(slug)}/copy`, {
        method: 'POST',
      });
      if (res.ok) {
        const data = (await res.json()) as { count?: number };
        if (typeof data.count === 'number') {
          window.dispatchEvent(
            new CustomEvent('prompt-copy-bump', { detail: { count: data.count } })
          );
        }
      }
    } catch {
      // swallow — copy already succeeded client-side, counter is best-effort
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div className="sticky bottom-4 z-20 mx-auto max-w-3xl">
        <div className="bg-background-secondary/80 backdrop-blur border border-border rounded-full p-1 shadow-elevated">
          <button
            type="button"
            onClick={handleClick}
            disabled={pending}
            className="w-full inline-flex items-center justify-center gap-2 h-12 px-6 text-base font-medium text-text-primary bg-accent-brand hover:bg-accent-hover rounded-full transition-colors disabled:opacity-60"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5" strokeWidth={2.5} />
                Copiado
              </>
            ) : (
              <>
                <Copy className="w-5 h-5" />
                Copiar prompt
              </>
            )}
          </button>
        </div>
        {fallbackMessage && (
          <p className="mt-2 text-center text-[12px] text-text-muted">
            {fallbackMessage}
          </p>
        )}
      </div>

      <SuccessModal
        open={showModal}
        onClose={() => setShowModal(false)}
        slug={slug}
      />
    </>
  );
}
