import Link from 'next/link';
import type { Period } from '@/lib/supabase/leaderboard';

const OPTIONS: { key: Period; label: string }[] = [
  { key: 'week', label: 'This week' },
  { key: 'month', label: 'This month' },
  { key: 'all', label: 'All time' },
];

interface Props {
  active: Period;
  basePath: string;
}

export default function PeriodToggle({ active, basePath }: Props) {
  return (
    <div className="inline-flex items-center gap-1 p-0.5 bg-white/[0.02] border border-border rounded-full">
      {OPTIONS.map(({ key, label }) => {
        const href = key === 'week' ? basePath : `${basePath}?period=${key}`;
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={href}
            scroll={false}
            className={`inline-flex items-center h-7 px-3 text-xs font-medium rounded-full transition-colors ${
              isActive
                ? 'bg-white/[0.08] text-text-primary'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
