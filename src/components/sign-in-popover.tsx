'use client';

import { useEffect, useRef } from 'react';
import { Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
};

export default function SignInPopover({
  open,
  onClose,
  title = 'Sign in to continue',
  description = 'We use GitHub for identity only — no emails, no spam.',
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open, onClose]);

  if (!open) return null;

  async function signIn(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div
      ref={ref}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      className="absolute top-full right-0 mt-2 w-[260px] bg-background-secondary border border-border rounded-md shadow-elevated p-3 z-30"
    >
      <p className="text-[13px] font-medium text-text-primary mb-1">{title}</p>
      <p className="text-xs text-text-muted mb-3 leading-relaxed">{description}</p>
      <div className="flex gap-2">
        <button
          onClick={signIn}
          className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium text-white bg-accent-brand hover:bg-accent-hover rounded-full transition-colors"
        >
          <Github className="w-3.5 h-3.5" />
          Continue
        </button>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
          className="inline-flex items-center h-7 px-2.5 text-xs font-medium text-text-secondary bg-transparent hover:bg-white/[0.04] rounded-full transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
