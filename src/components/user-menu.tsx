'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Github, LogOut, User, Inbox, Bookmark } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Props = {
  user: {
    username: string;
    avatarUrl: string | null;
  } | null;
};

export default function UserMenu({ user }: Props) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  const scheduleClose = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => setOpen(false), 150);
  };
  const cancelClose = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

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
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => {
        cancelClose();
        setOpen(true);
      }}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Open user menu"
        className="block rounded-full focus:outline-none focus-visible:shadow-focus"
      >
        {user.avatarUrl ? (
          <Image
            src={user.avatarUrl}
            alt={user.username}
            width={28}
            height={28}
            className="rounded-full border border-border hover:border-border-solid transition-colors"
            unoptimized
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-white/[0.05] border border-border grid place-items-center text-[11px] font-medium text-text-primary">
            {user.username.slice(0, 1).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 w-[220px] bg-background-secondary border border-border rounded-md shadow-elevated py-1.5 z-40"
        >
          <div className="px-3 py-2 border-b border-border-subtle mb-1">
            <p className="text-[13px] font-medium text-text-primary truncate">
              @{user.username}
            </p>
          </div>
          <MenuLink
            href={`/u/${user.username}`}
            icon={<User className="w-3.5 h-3.5" />}
            onClick={() => setOpen(false)}
          >
            Profile
          </MenuLink>
          <MenuLink
            href="/submissions"
            icon={<Inbox className="w-3.5 h-3.5" />}
            onClick={() => setOpen(false)}
          >
            Your submissions
          </MenuLink>
          <MenuLink
            href="/saved"
            icon={<Bookmark className="w-3.5 h-3.5" />}
            onClick={() => setOpen(false)}
          >
            Saved
          </MenuLink>
          <MenuLink
            href="https://github.com/blainercosta/repo-wizard"
            icon={<Github className="w-3.5 h-3.5" />}
            external
          >
            GitHub
          </MenuLink>
          <div className="my-1 border-t border-border-subtle" />
          <button
            onClick={handleLogout}
            disabled={loading}
            role="menuitem"
            className="w-full flex items-center gap-2 px-3 h-8 text-[13px] text-text-secondary hover:bg-white/[0.04] hover:text-text-primary transition-colors disabled:opacity-60"
          >
            <LogOut className="w-3.5 h-3.5" />
            {loading ? 'Signing out...' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  );
}

function MenuLink({
  href,
  icon,
  children,
  onClick,
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  external?: boolean;
}) {
  const className =
    'flex items-center gap-2 px-3 h-8 text-[13px] text-text-secondary hover:bg-white/[0.04] hover:text-text-primary transition-colors';
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        role="menuitem"
        className={className}
      >
        {icon}
        {children}
      </a>
    );
  }
  return (
    <Link href={href} onClick={onClick} role="menuitem" className={className}>
      {icon}
      {children}
    </Link>
  );
}
