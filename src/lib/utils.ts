import { Category, CATEGORY_LABELS, type CommunityAgent } from '@/types/agent';
import type { SortKey } from '@/components/sort-control';

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };
  return date.toLocaleDateString('en-US', options);
}

export function getCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category] || category;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

export function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function agentHref(agent: CommunityAgent, fromCategory?: string): string {
  const base = `/agent/${agent.slug}`;
  return fromCategory ? `${base}?from=${fromCategory}` : base;
}

export function sortAgents(
  agents: CommunityAgent[],
  sort: SortKey,
  voteCounts?: Map<string, number>
): CommunityAgent[] {
  const copy = [...agents];
  if (sort === 'top' && voteCounts) {
    copy.sort((a, b) => {
      const diff = (voteCounts.get(b.id) ?? 0) - (voteCounts.get(a.id) ?? 0);
      if (diff !== 0) return diff;
      return new Date(b.updated).getTime() - new Date(a.updated).getTime();
    });
  } else if (sort === 'new') {
    copy.sort(
      (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
    );
  } else {
    copy.sort(
      (a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );
  }
  return copy;
}

export function parseSortParam(raw: string | string[] | undefined): SortKey {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val === 'top' || val === 'new') return val;
  return 'recent';
}

export function isNew(dateString: string, daysThreshold: number = 14): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = diffTime / (1000 * 60 * 60 * 24);
  return diffDays <= daysThreshold;
}
