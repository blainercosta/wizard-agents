export type Category = 'design' | 'development' | 'automation' | 'writing' | 'business' | 'marketing';

export interface CommunityAuthor {
  username: string;
  avatarUrl: string | null;
}

export interface CommunityAgent {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  version: string;
  tags: string[];
  content: string;
  rawContent: string;
  created: string;
  updated: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  author: CommunityAuthor;
}

// GitHub usernames whose agents are treated as curated (no Community badge,
// no author attribution shown). Add additional maintainers here.
export const CURATOR_USERNAMES = new Set(['blainercosta']);

export function isCurated(agent: CommunityAgent): boolean {
  return CURATOR_USERNAMES.has(agent.author.username);
}

export const CATEGORIES: { value: Category | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Dev' },
  { value: 'automation', label: 'Automation' },
  { value: 'writing', label: 'Writing' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
];

export const CATEGORY_LABELS: Record<Category, string> = {
  design: 'Design',
  development: 'Dev',
  automation: 'Automation',
  writing: 'Writing',
  business: 'Business',
  marketing: 'Marketing',
};
