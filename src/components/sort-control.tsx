import Link from 'next/link';

export type SortKey = 'recent' | 'top' | 'new';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'top', label: 'Top' },
  { key: 'new', label: 'New' },
];

interface SortControlProps {
  active: SortKey;
  basePath: string;
}

export default function SortControl({ active, basePath }: SortControlProps) {
  return (
    <div className="inline-flex items-center gap-1 p-0.5 bg-white/[0.02] border border-border rounded-full">
      {SORT_OPTIONS.map(({ key, label }) => {
        const href = key === 'recent' ? basePath : `${basePath}?sort=${key}`;
        const isActive = active === key;
        return (
          <Link
            key={key}
            href={href}
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
