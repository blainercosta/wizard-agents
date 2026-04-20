import Link from 'next/link';
import {
  DEFAULT_CATEGORY_OPTIONS,
  type Category,
  type CommunityAgent,
} from '@/types/agent';
import { getCategoryLabel } from '@/lib/utils';
import type { SortKey } from './sort-control';

interface CategoryFilterProps {
  activeCategory?: Category | 'all';
  agents?: CommunityAgent[];
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

type Option = { value: string; label: string };

function buildOptions(
  agents: CommunityAgent[] | undefined,
  activeCategory: Category | 'all'
): Option[] {
  const options: Option[] = [{ value: 'all', label: 'All' }];
  if (!agents) {
    return [...options, ...DEFAULT_CATEGORY_OPTIONS];
  }

  const seen = new Map<string, string>();
  for (const a of agents) {
    if (!seen.has(a.category)) {
      seen.set(a.category, getCategoryLabel(a.category, a.categoryLabel));
    }
  }

  // Always include the active category even if it has no agents yet
  if (activeCategory !== 'all' && !seen.has(activeCategory)) {
    seen.set(activeCategory, getCategoryLabel(activeCategory));
  }

  // Preserve the default ordering where possible, then append any extras alpha-sorted
  const defaultsPresent = DEFAULT_CATEGORY_OPTIONS.filter((o) =>
    seen.has(o.value)
  );
  const extras = Array.from(seen.entries())
    .filter(([slug]) => !DEFAULT_CATEGORY_OPTIONS.some((o) => o.value === slug))
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return [...options, ...defaultsPresent, ...extras];
}

export default function CategoryFilter({
  activeCategory = 'all',
  agents,
  currentSort,
}: CategoryFilterProps) {
  const counts = new Map<string, number>();
  if (agents) {
    for (const a of agents) {
      counts.set(a.category, (counts.get(a.category) ?? 0) + 1);
    }
  }

  const visible = buildOptions(agents, activeCategory);

  return (
    <div className="flex flex-wrap gap-2">
      {visible.map(({ value, label }) => {
        const isActive = activeCategory === value;
        const href = buildListingHref(value as Category | 'all', currentSort);
        const count = value === 'all' ? agents?.length : counts.get(value);

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
