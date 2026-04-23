'use client';

import { useState, useEffect } from 'react';

function format(n: number): string {
  if (n < 1000) return n.toLocaleString('pt-BR');
  if (n < 10_000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}

type Props = {
  slug: string;
  initialCount: number;
};

export default function CopyCounter({ initialCount }: Props) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    function onBump(e: Event) {
      const detail = (e as CustomEvent<{ count?: number }>).detail;
      if (typeof detail?.count === 'number') setCount(detail.count);
    }
    window.addEventListener('prompt-copy-bump', onBump as EventListener);
    return () => {
      window.removeEventListener('prompt-copy-bump', onBump as EventListener);
    };
  }, []);

  if (count <= 0) return null;

  return (
    <span className="inline-flex items-center h-6 px-2.5 text-[11px] font-medium text-text-muted bg-white/[0.04] border border-border-subtle rounded-full tabular-nums">
      {format(count)} {count === 1 ? 'cópia' : 'cópias'}
    </span>
  );
}
