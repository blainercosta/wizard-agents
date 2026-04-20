import Link from 'next/link';
import type { Category } from '@/types/agent';
import { buildListingHref } from './category-filter';

export type SortKey = 'recent' | 'top' | 'new';

export const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Recent' },
  { key: 'top', label: 'Top' },
  { key: 'new', label: 'New' },
];

interface SortControlProps {
  active: SortKey;
  currentCategory?: Category | 'all';
}

export default function SortControl({
  active,
  currentCategory = 'all',
}: SortControlProps) {
  return (
    <div className="inline-flex items-center gap-1 p-0.5 bg-white/[0.02] border border-border rounded-full">
      {SORT_OPTIONS.map(({ key, label }) => {
        const href = buildListingHref(currentCategory, key);
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
