import Link from 'next/link';
import { CATEGORIES, Category } from '@/types/agent';

interface CategoryFilterProps {
  activeCategory?: Category | 'all';
}

export default function CategoryFilter({ activeCategory = 'all' }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-8">
      {CATEGORIES.map(({ value, label }) => {
        const isActive = activeCategory === value;
        const href = value === 'all' ? '/' : `/category/${value}`;

        return (
          <Link
            key={value}
            href={href}
            className={`inline-flex items-center h-8 px-3 text-[13px] font-medium rounded-full border transition-colors ${
              isActive
                ? 'bg-white/[0.08] border-border text-text-primary'
                : 'bg-transparent border-border-solid text-text-secondary hover:text-text-primary hover:border-border'
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
