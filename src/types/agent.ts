export type Category = 'design' | 'development' | 'automation' | 'writing' | 'business' | 'marketing';

export interface AgentFrontmatter {
  name: string;
  slug: string;
  category: Category;
  version: string;
  compatibility: string[];
  description: string;
  tags?: string[];
  created: string;
  updated: string;
}

export interface Agent extends AgentFrontmatter {
  content: string;
  rawContent: string;
}

// AgentCard includes frontmatter + rawContent for copy/download functionality
export interface AgentCard extends AgentFrontmatter {
  rawContent: string;
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

export type ListedAgent =
  | ({ source: 'official' } & AgentCard)
  | ({ source: 'community' } & CommunityAgent);

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
