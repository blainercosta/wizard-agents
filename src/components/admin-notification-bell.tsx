'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

type PendingAgent = {
  id: string;
  name: string;
  slug: string;
  authorUsername: string;
  createdAt: string;
};

type Props = {
  pendingAgents: PendingAgent[];
};

export default function AdminNotificationBell({ pendingAgents }: Props) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const count = pendingAgents.length;

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
        aria-label={count > 0 ? `${count} agents pending review` : 'No notifications'}
        className="relative w-8 h-8 grid place-items-center rounded-full text-text-secondary hover:text-text-primary hover:bg-white/[0.04] transition-colors focus:outline-none focus-visible:shadow-focus"
      >
        <Bell className="w-4 h-4" />
        {count > 0 && (
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent-brand border border-background-secondary" />
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute top-full right-0 mt-2 w-[320px] bg-background-secondary border border-border rounded-md shadow-elevated py-1.5 z-40"
        >
          <div className="px-3 py-2 border-b border-border-subtle mb-1 flex items-center justify-between">
            <p className="text-[13px] font-medium text-text-primary">
              Pending review
            </p>
            {count > 0 && (
              <span className="inline-flex items-center h-5 px-2 text-[10px] font-medium text-accent-hover bg-accent-brand/15 border border-accent-brand/40 rounded-full">
                {count}
              </span>
            )}
          </div>

          {count === 0 ? (
            <div className="px-3 py-6 text-center">
              <p className="text-[13px] text-text-muted">All caught up.</p>
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto">
              {pendingAgents.slice(0, 8).map((agent) => (
                <Link
                  key={agent.id}
                  href="/admin"
                  onClick={() => setOpen(false)}
                  role="menuitem"
                  className="block px-3 py-2 hover:bg-white/[0.04] transition-colors"
                >
                  <p className="text-[13px] font-medium text-text-primary truncate">
                    {agent.name}
                  </p>
                  <p className="text-[11px] text-text-muted truncate">
                    by @{agent.authorUsername}
                  </p>
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-border-subtle mt-1 pt-1">
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              role="menuitem"
              className="flex items-center justify-center px-3 h-8 text-[13px] font-medium text-accent-lilac hover:text-accent-hover transition-colors"
            >
              Open admin
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
