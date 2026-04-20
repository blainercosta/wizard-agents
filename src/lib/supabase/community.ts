import type { SupabaseClient } from '@supabase/supabase-js';
import type { Category, CommunityAgent } from '@/types/agent';

type Row = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: Category;
  category_label: string | null;
  version: string;
  tags: string[];
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  user_id: string;
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
    categoryLabel: row.category_label,
    version: row.version,
    tags: row.tags,
    content: row.content,
    rawContent: buildRawContent(row),
    created: row.created_at,
    updated: row.updated_at,
    status: row.status,
    rejectionReason: row.rejection_reason,
    ownerId: row.user_id,
    author: {
      username: row.author_username,
      avatarUrl: row.author_avatar_url,
    },
  };
}

const COLUMNS =
  'id, slug, name, description, category, category_label, version, tags, content, status, rejection_reason, user_id, author_username, author_avatar_url, created_at, updated_at';

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

export async function getCommunityAgentsByStatus(
  supabase: SupabaseClient,
  status: 'pending' | 'approved' | 'rejected'
): Promise<CommunityAgent[]> {
  const { data } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .eq('status', status)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  return (data ?? []).map(rowToAgent);
}

export async function getModerationCounts(
  supabase: SupabaseClient
): Promise<Record<'pending' | 'approved' | 'rejected', number>> {
  const statuses: Array<'pending' | 'approved' | 'rejected'> = [
    'pending',
    'approved',
    'rejected',
  ];
  const results = await Promise.all(
    statuses.map((s) =>
      supabase
        .from('community_agents')
        .select('*', { count: 'exact', head: true })
        .eq('status', s)
        .is('deleted_at', null)
    )
  );
  return {
    pending: results[0].count ?? 0,
    approved: results[1].count ?? 0,
    rejected: results[2].count ?? 0,
  };
}

export async function getUserSubmissions(
  supabase: SupabaseClient,
  userId: string
): Promise<CommunityAgent[]> {
  const { data } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .eq('user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false });

  return (data ?? []).map(rowToAgent);
}

export async function getAgentsByIds(
  supabase: SupabaseClient,
  ids: string[]
): Promise<CommunityAgent[]> {
  if (ids.length === 0) return [];
  const { data } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .in('id', ids)
    .eq('status', 'approved')
    .is('deleted_at', null);
  return (data ?? []).map(rowToAgent);
}

export async function getUserBookmarkedSet(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const { data } = await supabase
    .from('bookmarks')
    .select('agent_id')
    .eq('user_id', userId);

  const set = new Set<string>();
  if (!data) return set;
  for (const row of data) set.add(row.agent_id);
  return set;
}

export type UserProfile = {
  username: string;
  avatarUrl: string | null;
  githubId: number | null;
};

export async function getUserProfileByUsername(
  supabase: SupabaseClient,
  username: string
): Promise<UserProfile | null> {
  const [agentRes, voteRes] = await Promise.all([
    supabase
      .from('community_agents')
      .select('author_username, author_avatar_url, author_github_id')
      .eq('author_username', username)
      .eq('status', 'approved')
      .is('deleted_at', null)
      .limit(1)
      .maybeSingle(),
    supabase
      .from('votes')
      .select('github_username, github_avatar_url, github_user_id')
      .eq('github_username', username)
      .limit(1)
      .maybeSingle(),
  ]);

  const fromAgent = agentRes.data;
  const fromVote = voteRes.data;
  if (!fromAgent && !fromVote) return null;

  return {
    username,
    avatarUrl: fromAgent?.author_avatar_url ?? fromVote?.github_avatar_url ?? null,
    githubId: fromAgent?.author_github_id ?? fromVote?.github_user_id ?? null,
  };
}

export async function getAgentsByAuthor(
  supabase: SupabaseClient,
  username: string
): Promise<CommunityAgent[]> {
  const { data } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .eq('author_username', username)
    .eq('status', 'approved')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (data ?? []).map(rowToAgent);
}

export async function getPublicEndorsementsByUser(
  supabase: SupabaseClient,
  username: string
): Promise<CommunityAgent[]> {
  const { data: votes } = await supabase
    .from('votes')
    .select('target_id, created_at')
    .eq('github_username', username)
    .eq('is_public', true)
    .eq('target_type', 'community')
    .order('created_at', { ascending: false });

  if (!votes || votes.length === 0) return [];

  const ids = votes.map((v) => v.target_id);
  const { data: agents } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .in('id', ids)
    .eq('status', 'approved')
    .is('deleted_at', null);

  if (!agents) return [];

  const byId = new Map(agents.map((a) => [a.id, rowToAgent(a)]));
  return votes
    .map((v) => byId.get(v.target_id))
    .filter((a): a is CommunityAgent => Boolean(a));
}

export async function getUserBookmarks(
  supabase: SupabaseClient,
  userId: string
): Promise<CommunityAgent[]> {
  const { data: bookmarks } = await supabase
    .from('bookmarks')
    .select('agent_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (!bookmarks || bookmarks.length === 0) return [];

  const agentIds = bookmarks.map((b) => b.agent_id);

  const { data: agents } = await supabase
    .from('community_agents')
    .select(COLUMNS)
    .in('id', agentIds)
    .eq('status', 'approved')
    .is('deleted_at', null);

  if (!agents) return [];

  const byId = new Map(agents.map((a) => [a.id, rowToAgent(a)]));
  return bookmarks
    .map((b) => byId.get(b.agent_id))
    .filter((a): a is CommunityAgent => Boolean(a));
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
