import type { SupabaseClient } from '@supabase/supabase-js';

export type VoteTarget = {
  type: 'official' | 'community';
  id: string;
};

const key = (t: VoteTarget) => `${t.type}:${t.id}`;

export async function getVoteCountsBatch(
  supabase: SupabaseClient,
  targets: VoteTarget[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (targets.length === 0) return counts;

  const officialIds = targets.filter((t) => t.type === 'official').map((t) => t.id);
  const communityIds = targets.filter((t) => t.type === 'community').map((t) => t.id);

  const queries = [];
  if (officialIds.length > 0) {
    queries.push(
      supabase
        .from('votes')
        .select('target_id')
        .eq('target_type', 'official')
        .in('target_id', officialIds)
    );
  }
  if (communityIds.length > 0) {
    queries.push(
      supabase
        .from('votes')
        .select('target_id')
        .eq('target_type', 'community')
        .in('target_id', communityIds)
    );
  }

  const results = await Promise.all(queries);
  for (const { data } of results) {
    if (!data) continue;
    for (const row of data) {
      const target = officialIds.includes(row.target_id)
        ? { type: 'official' as const, id: row.target_id }
        : { type: 'community' as const, id: row.target_id };
      counts.set(key(target), (counts.get(key(target)) ?? 0) + 1);
    }
  }

  return counts;
}

export async function getUserVotedSet(
  supabase: SupabaseClient,
  userId: string,
  targets: VoteTarget[]
): Promise<Set<string>> {
  const voted = new Set<string>();
  if (targets.length === 0) return voted;

  const { data } = await supabase
    .from('votes')
    .select('target_type, target_id')
    .eq('user_id', userId);

  if (!data) return voted;
  for (const row of data) {
    voted.add(`${row.target_type}:${row.target_id}`);
  }
  return voted;
}

export async function getPublicSupporters(
  supabase: SupabaseClient,
  target: VoteTarget,
  limit = 50
): Promise<Array<{ username: string; avatarUrl: string | null }>> {
  const { data } = await supabase
    .from('votes')
    .select('github_username, github_avatar_url')
    .eq('target_type', target.type)
    .eq('target_id', target.id)
    .eq('is_public', true)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (!data) return [];
  return data.map((row) => ({
    username: row.github_username,
    avatarUrl: row.github_avatar_url,
  }));
}

export async function getUserVoteState(
  supabase: SupabaseClient,
  userId: string,
  target: VoteTarget
): Promise<{ voted: boolean; isPublic: boolean }> {
  const { data } = await supabase
    .from('votes')
    .select('is_public')
    .eq('target_type', target.type)
    .eq('target_id', target.id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return { voted: false, isPublic: false };
  return { voted: true, isPublic: data.is_public };
}
