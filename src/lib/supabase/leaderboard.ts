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

type TopPersonRow = {
  username: string;
  avatar_url: string | null;
  count: number;
};

type TopAgentRow = {
  target_id: string;
  count: number;
};

export async function getTopContributors(
  supabase: SupabaseClient,
  period: Period,
  limit = 10
): Promise<LeaderEntry[]> {
  const { data } = await supabase.rpc('top_contributors', {
    p_since: periodToDate(period),
    p_limit: limit,
  });

  if (!data) return [];
  return (data as TopPersonRow[]).map((row) => ({
    username: row.username,
    avatarUrl: row.avatar_url,
    count: Number(row.count),
  }));
}

export async function getTopEndorsers(
  supabase: SupabaseClient,
  period: Period,
  limit = 10
): Promise<LeaderEntry[]> {
  const { data } = await supabase.rpc('top_endorsers', {
    p_since: periodToDate(period),
    p_limit: limit,
  });

  if (!data) return [];
  return (data as TopPersonRow[]).map((row) => ({
    username: row.username,
    avatarUrl: row.avatar_url,
    count: Number(row.count),
  }));
}

export async function getTopAgentsByPeriod(
  supabase: SupabaseClient,
  period: Period,
  limit = 10
): Promise<AgentLeaderEntry[]> {
  const { data } = await supabase.rpc('top_agents_by_votes', {
    p_since: periodToDate(period),
    p_limit: limit,
  });

  if (!data || (data as TopAgentRow[]).length === 0) return [];
  const rows = data as TopAgentRow[];

  const agents = await getAgentsByIds(
    supabase,
    rows.map((r) => r.target_id)
  );
  const byId = new Map(agents.map((a) => [a.id, a]));

  return rows
    .map((r) => {
      const agent = byId.get(r.target_id);
      return agent ? { agent, count: Number(r.count) } : null;
    })
    .filter((x): x is AgentLeaderEntry => x !== null);
}
