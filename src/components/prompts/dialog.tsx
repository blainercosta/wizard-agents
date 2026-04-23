'use client';

import { useEffect, useRef } from 'react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
};

export function Dialog({ open, onClose, labelledBy, children }: DialogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;

    lastFocusedRef.current = document.activeElement as HTMLElement | null;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);

    const focusable = containerRef.current?.querySelector<HTMLElement>(
      'button, a, [tabindex]:not([tabindex="-1"])'
    );
    focusable?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      body.style.overflow = previousOverflow;
      lastFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-background-primary/70 backdrop-blur-sm"
      />
      <div
        ref={containerRef}
        className="relative bg-background-secondary border border-border rounded-lg shadow-elevated w-[min(420px,calc(100vw-2rem))] mx-4"
      >
        {children}
      </div>
    </div>
  );
}
