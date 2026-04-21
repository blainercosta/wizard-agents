'use client';

import { useState } from 'react';
import { Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { track } from '@/lib/analytics';

type Props = {
  next?: string;
  label?: string;
  loadingLabel?: string;
  className?: string;
};

export default function SignInWithGithubButton({
  next = '/',
  label = 'Sign in with GitHub',
  loadingLabel = 'Signing in...',
  className = '',
}: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleClick() {
    setLoading(true);
    track('sign_in_started', { source: next });
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center gap-2 h-9 px-4 text-[13px] font-medium text-background-primary bg-white hover:bg-white/90 rounded-full transition-colors disabled:opacity-60 disabled:cursor-wait ${className}`}
    >
      <Github className="w-3.5 h-3.5" />
      {loading ? loadingLabel : label}
    </button>
  );
}
