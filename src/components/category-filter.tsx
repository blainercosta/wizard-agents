import Link from 'next/link';
import { CATEGORIES, Category, type ListedAgent } from '@/types/agent';
import type { SortKey } from './sort-control';

interface CategoryFilterProps {
  activeCategory?: Category | 'all';
  agents?: ListedAgent[];
  currentSort?: SortKey;
}

export function buildListingHref(
  category: Category | 'all',
  sort?: SortKey
): string {
  const params = new URLSearchParams();
  if (category !== 'all') params.set('category', category);
  if (sort && sort !== 'recent') params.set('sort', sort);
  const qs = params.toString();
  return qs ? `/?${qs}` : '/';
}

export default function CategoryFilter({
  activeCategory = 'all',
  agents,
  currentSort,
}: CategoryFilterProps) {
  const counts = new Map<Category, number>();
  if (agents) {
    for (const a of agents) {
      counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    }
  }

  const visible = CATEGORIES.filter(({ value }) => {
    if (value === 'all') return true;
    if (!agents) return true;
    return (counts.get(value as Category) ?? 0) > 0 || value === activeCategory;
  });

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map(({ value, label }) => {
        const isActive = activeCategory === value;
        const href = buildListingHref(value as Category | 'all', currentSort);
        const count = value === 'all' ? agents?.length : counts.get(value as Category);

        return (
          <Link
            key={value}
            href={href}
            scroll={false}
            className={`inline-flex items-center gap-1.5 h-8 px-3 text-[13px] font-medium rounded-full border transition-colors ${
              isActive
                ? 'bg-white/[0.08] border-border text-text-primary'
                : 'bg-transparent border-border-solid text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            {label}
            {agents && count !== undefined && (
              <span className="text-text-muted tabular-nums">{count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
