'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Github } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  user: {
    username: string;
    avatarUrl: string | null;
  } | null;
};

export default function AuthButtons({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  async function handleLogin() {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  }

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (!user) {
    return (
      <button
        onClick={handleLogin}
        disabled={loading}
        className="inline-flex items-center gap-2 h-8 px-3 text-[13px] font-medium text-background-primary bg-white hover:bg-white/90 rounded-full transition-colors disabled:opacity-60 disabled:cursor-wait"
      >
        <Github className="w-3.5 h-3.5" />
        {loading ? 'Signing in...' : 'Sign in'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.avatarUrl && (
        <Image
          src={user.avatarUrl}
          alt={user.username}
          width={24}
          height={24}
          className="rounded-full border border-border"
        />
      )}
      <span className="text-[13px] text-text-secondary hidden sm:inline">
        @{user.username}
      </span>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center h-8 px-3 text-[13px] font-medium text-text-secondary bg-white/[0.02] border border-border rounded-full hover:bg-white/[0.05] hover:text-text-primary transition-colors disabled:opacity-60"
      >
        {loading ? '...' : 'Sign out'}
      </button>
    </div>
  );
}
