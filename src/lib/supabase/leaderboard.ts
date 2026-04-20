import type { SupabaseClient } from '@supabase/supabase-js';
import type { CommunityAgent } from '@/types/agent';
import { getAgentsByIds } from './community';

export type Period = 'week' | 'month' | 'all';

export type LeaderEntry = {
  username: string;
  avatarUrl: string | null;
  count: number;
};

export type AgentLeaderEntry = {
  agent: CommunityAgent;
  count: number;
};

export function parsePeriod(raw: string | string[] | undefined): Period {
  const val = Array.isArray(raw) ? raw[0] : raw;
  if (val === 'month' || val === 'all') return val;
  return 'week';
}

export function periodToDate(period: Period): string | null {
  if (period === 'all') return null;
  const days = period === 'week' ? 7 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}

export const PERIOD_LABEL: Record<Period, string> = {
  week: 'This week',
  month: 'This month',
  all: 'All time',
};

export async function getTopContributors(
  supabase: SupabaseClient,
  period: Period,
  limit = 10
): Promise<LeaderEntry[]> {
  let query = supabase
    .from('community_agents')
    .select('author_username, author_avatar_url, created_at')
    .eq('status', 'approved')
    .is('deleted_at', null);

  const since = periodToDate(period);
  if (since) query = query.gte('created_at', since);

  const { data } = await query;
  if (!data) return [];

  const map = new Map<string, { avatarUrl: string | null; count: number }>();
  for (const row of data) {
    if (!row.author_username) continue;
    const existing = map.get(row.author_username);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(row.author_username, {
        avatarUrl: row.author_avatar_url ?? null,
        count: 1,
      });
    }
  }

  return Array.from(map.entries())
    .map(([username, v]) => ({ username, avatarUrl: v.avatarUrl, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTopEndorsers(
  supabase: SupabaseClient,
  period: Period,
  limit = 10
): Promise<LeaderEntry[]> {
  let query = supabase
    .from('votes')
    .select('github_username, github_avatar_url, created_at')
    .eq('target_type', 'community')
    .eq('is_public', true);

  const since = periodToDate(period);
  if (since) query = query.gte('created_at', since);

  const { data } = await query;
  if (!data) return [];

  const map = new Map<string, { avatarUrl: string | null; count: number }>();
  for (const row of data) {
    if (!row.github_username) continue;
    const existing = map.get(row.github_username);
    if (existing) {
      existing.count += 1;
    } else {
      map.set(row.github_username, {
        avatarUrl: row.github_avatar_url ?? null,
        count: 1,
      });
    }
  }

  return Array.from(map.entries())
    .map(([username, v]) => ({ username, avatarUrl: v.avatarUrl, count: v.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export async function getTopAgentsByPeriod(
  supabase: SupabaseClient,
  period: Period,
  limit = 10
): Promise<AgentLeaderEntry[]> {
  let query = supabase
    .from('votes')
    .select('target_id')
    .eq('target_type', 'community');

  const since = periodToDate(period);
  if (since) query = query.gte('created_at', since);

  const { data } = await query;
  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data) {
    counts.set(row.target_id, (counts.get(row.target_id) ?? 0) + 1);
  }

  const top = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  if (top.length === 0) return [];

  const ids = top.map(([id]) => id);
  const agents = await getAgentsByIds(supabase, ids);
  const byId = new Map(agents.map((a) => [a.id, a]));

  return top
    .map(([id, count]) => {
      const agent = byId.get(id);
      return agent ? { agent, count } : null;
    })
    .filter((x): x is AgentLeaderEntry => x !== null);
}
