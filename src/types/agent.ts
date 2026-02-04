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
