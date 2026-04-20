'use client';

import { useState } from 'react';
import Image from 'next/image';
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
        className="border-2 border-border px-3 py-1.5 font-mono text-xs text-text-primary hover:border-accent-neon hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-wait"
      >
        {loading ? 'Signing in...' : 'Login with GitHub'}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {user.avatarUrl && (
        <Image
          src={user.avatarUrl}
          alt={user.username}
          width={28}
          height={28}
          className="border-2 border-border"
        />
      )}
      <span className="font-mono text-xs text-text-secondary hidden sm:inline">
        @{user.username}
      </span>
      <button
        onClick={handleLogout}
        disabled={loading}
        className="border-2 border-border px-3 py-1.5 font-mono text-xs text-text-secondary hover:border-accent-neon hover:text-text-primary transition-all disabled:opacity-50"
      >
        {loading ? '...' : 'Logout'}
      </button>
    </div>
  );
}
