import { cache } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';

const TARGET_TYPE = 'community';

async function getVoteCountsBatchImpl(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  if (ids.length === 0) return counts;

  const { data } = await supabase
    .from('votes')
    .select('target_id')
    .eq('target_type', TARGET_TYPE)
    .in('target_id', ids);

  if (!data) return counts;
  for (const row of data) {
    counts.set(row.target_id, (counts.get(row.target_id) ?? 0) + 1);
  }
  return counts;
}

// Cache keyed by the joined id list so two components asking for the same
// agents share the query. React.cache needs a stable reference argument —
// we wrap with a key-normalizer.
const getVoteCountsForKey = cache(
  async (
    supabase: SupabaseClient,
    _key: string,
    ids: string[]
  ): Promise<Map<string, number>> => getVoteCountsBatchImpl(supabase, ids)
);

export function getVoteCountsBatch(
  supabase: SupabaseClient,
  ids: string[]
): Promise<Map<string, number>> {
  const key = [...ids].sort().join('|');
  return getVoteCountsForKey(supabase, key, ids);
}

export async function getTotalVoteCount(
  supabase: SupabaseClient
): Promise<number> {
  const { count } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', TARGET_TYPE);
  return count ?? 0;
}

export async function getVoteCountSince(
  supabase: SupabaseClient,
  sinceIso: string
): Promise<number> {
  const { count } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true })
    .eq('target_type', TARGET_TYPE)
    .gte('created_at', sinceIso);
  return count ?? 0;
}

export async function getUserVotedSet(
  supabase: SupabaseClient,
  userId: string,
  ids: string[]
): Promise<Set<string>> {
  const voted = new Set<string>();
  if (ids.length === 0) return voted;

  const { data } = await supabase
    .from('votes')
    .select('target_id')
    .eq('target_type', TARGET_TYPE)
    .eq('user_id', userId)
    .in('target_id', ids);

  if (!data) return voted;
  for (const row of data) {
    voted.add(row.target_id);
  }
  return voted;
}

export async function getPublicSupporters(
  supabase: SupabaseClient,
  id: string,
  limit = 50
): Promise<Array<{ username: string; avatarUrl: string | null }>> {
  const { data } = await supabase
    .from('votes')
    .select('github_username, github_avatar_url')
    .eq('target_type', TARGET_TYPE)
    .eq('target_id', id)
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
  id: string
): Promise<{ voted: boolean; isPublic: boolean }> {
  const { data } = await supabase
    .from('votes')
    .select('is_public')
    .eq('target_type', TARGET_TYPE)
    .eq('target_id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!data) return { voted: false, isPublic: false };
  return { voted: true, isPublic: data.is_public };
}

export const VOTE_TARGET_TYPE = TARGET_TYPE;
