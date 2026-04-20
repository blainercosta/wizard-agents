import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, CommunityAgent } from '@/types/agent';

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  version: string;
  tags: string[];
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  author_username: string;
  author_avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

function buildRawContent(row: Row): string {
  const tagsYaml = row.tags.length > 0 ? `[${row.tags.map((t) => `"${t}"`).join(', ')}]` : '[]';
  const frontmatter = [
    '---',
    `name: "${row.name}"`,
    `slug: "${row.slug}"`,
    `category: "${row.category}"`,
    `version: "${row.version}"`,
    `description: "${row.description.replace(/"/g, '\\"')}"`,
    `tags: ${tagsYaml}`,
    `author: "@${row.author_username}"`,
    `created: "${row.created_at.slice(0, 10)}"`,
    `updated: "${row.updated_at.slice(0, 10)}"`,
    '---',
    '',
  ].join('\n');
  return frontmatter + row.content;
}

function rowToAgent(row: Row): CommunityAgent {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    category: row.category,
    version: row.version,
    tags: row.tags,
    content: row.content,
    rawContent: buildRawContent(row),
    created: row.created_at,
    updated: row.updated_at,
    status: row.status,
    rejectionReason: row.rejection_reason,
    author: {
      username: row.author_username,
      avatarUrl: row.author_avatar_url,
    },
  };
}

const COLUMNS =
  'id, slug, name, description, category, version, tags, content, status, rejection_reason, author_username, author_avatar_url, created_at, updated_at';

export async function getApprovedCommunityAgents(
  supabase: SupabaseClient
): Promise<CommunityAgent[]> {
  const { data } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .eq('status', 'approved')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (data ?? []).map(rowToAgent);
}

export async function getCommunityAgentBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<CommunityAgent | null> {
  const { data } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .eq('slug', slug)
    .eq('status', 'approved')
    .is('deleted_at', null)
    .maybeSingle();

  if (!data) return null;
  return rowToAgent(data);
}

export async function getPendingCommunityAgents(
  supabase: SupabaseClient
): Promise<CommunityAgent[]> {
  const { data } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .eq('status', 'pending')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (data ?? []).map(rowToAgent);
}

export async function isCurrentUserAdmin(
  supabase: SupabaseClient
): Promise<boolean> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const providerId = user.user_metadata?.provider_id;
  if (!providerId) return false;

  const { data } = await supabase
    .from('admins')
    .select('github_user_id')
    .eq('github_user_id', Number(providerId))
    .maybeSingle();

  return !!data;
}
