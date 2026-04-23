'use client';

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import type { I18n } from '@/lib/i18n';

function format(n: number): string {
  if (n < 1000) return n.toLocaleString();
  if (n < 10_000) return `${(n / 1000).toFixed(1)}k`;
  return `${Math.round(n / 1000)}k`;
}

type Props = {
  slug: string;
  initialCount: number;
  t: I18n;
};

export default function CopyCounter({ initialCount, t }: Props) {
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
    <span className="inline-flex items-center gap-1.5 text-[13px] text-text-muted tabular-nums">
      <Heart className="w-3.5 h-3.5 text-accent-lilac" fill="currentColor" strokeWidth={0} />
      {t.downloadsTemplate.replace('{count}', format(count))}
    </span>
  );
}
