// Category is now a free-form string slug. Authors can propose new ones via
// the submit form; admins accept them implicitly by approving the agent.
export type Category = string;

export const DEFAULT_CATEGORY_SLUGS = [
  'design',
  'development',
  'automation',
  'writing',
  'business',
  'marketing',
] as const;

export function isDefaultCategory(slug: string): boolean {
  return (DEFAULT_CATEGORY_SLUGS as readonly string[]).includes(slug);
}

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
  categoryLabel: string | null;
  version: string;
  tags: string[];
  content: string;
  rawContent: string;
  created: string;
  updated: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason: string | null;
  ownerId: string;
  author: CommunityAuthor;
}

// GitHub usernames whose agents are treated as curated (no Community badge,
// no author attribution shown). Add additional maintainers here.
export const CURATOR_USERNAMES = new Set(['blainercosta']);

export function isCurated(agent: CommunityAgent): boolean {
  return CURATOR_USERNAMES.has(agent.author.username);
}

export const DEFAULT_CATEGORY_LABELS: Record<string, string> = {
  design: 'Design',
  development: 'Dev',
  automation: 'Automation',
  writing: 'Writing',
  business: 'Business',
  marketing: 'Marketing',
};

export const DEFAULT_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'design', label: 'Design' },
  { value: 'development', label: 'Dev' },
  { value: 'automation', label: 'Automation' },
  { value: 'writing', label: 'Writing' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
];
