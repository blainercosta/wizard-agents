import type { SupabaseClient } from '@supabase/supabase-js';

export type AgentVersion = {
  id: string;
  version: string;
  description: string | null;
  content: string;
  tags: string[];
  archivedAt: string;
};

type Row = {
  id: string;
  version: string;
  description: string | null;
  content: string;
  tags: string[];
  archived_at: string;
};

export async function getVersionsForAgent(
  supabase: SupabaseClient,
  agentId: string
): Promise<AgentVersion[]> {
  const { data } = await supabase
    .from('agent_versions')
    .select('id, version, description, content, tags, archived_at')
    .eq('agent_id', agentId)
    .order('archived_at', { ascending: false });

  if (!data) return [];
  return data.map((row: Row) => ({
    id: row.id,
    version: row.version,
    description: row.description,
    content: row.content,
    tags: row.tags ?? [],
    archivedAt: row.archived_at,
  }));
}
