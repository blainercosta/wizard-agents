import Link from 'next/link';
import { CATEGORIES, Category } from '@/types/agent';

interface CategoryFilterProps {
  activeCategory?: Category | 'all';
}

export default function CategoryFilter({ activeCategory = 'all' }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-8">
      {CATEGORIES.map(({ value, label }) => {
        const isActive = activeCategory === value;
        const href = value === 'all' ? '/' : `/category/${value}`;

        return (
          <Link
            key={value}
            href={href}
            className={`
              px-5 py-3 font-mono text-sm uppercase transition-all duration-150
              ${
                isActive
                  ? 'bg-accent-lilac text-white border-2 border-accent-lilac'
                  : 'bg-transparent text-text-secondary border-2 border-border hover:border-accent-lilac hover:text-accent-lilac'
              }
            `}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
