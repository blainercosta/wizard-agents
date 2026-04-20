import type { SupabaseClient } from '@supabase/supabase-js';

export type CommentKind = 'comment' | 'thanks' | 'suggestion' | 'critique';

export type AgentComment = {
  id: string;
  userId: string;
  username: string;
  avatarUrl: string | null;
  body: string;
  kind: CommentKind;
  resolved: boolean;
  resolvedReply: string | null;
  resolvedAt: string | null;
  createdAt: string;
};

type Row = {
  id: string;
  user_id: string;
  github_username: string;
  github_avatar_url: string | null;
  body: string;
  kind: CommentKind;
  resolved: boolean;
  resolved_reply: string | null;
  resolved_at: string | null;
  created_at: string;
};

function rowToComment(row: Row): AgentComment {
  return {
    id: row.id,
    userId: row.user_id,
    username: row.github_username,
    avatarUrl: row.github_avatar_url,
    body: row.body,
    kind: row.kind,
    resolved: row.resolved,
    resolvedReply: row.resolved_reply,
    resolvedAt: row.resolved_at,
    createdAt: row.created_at,
  };
}

const COLUMNS =
  'id, user_id, github_username, github_avatar_url, body, kind, resolved, resolved_reply, resolved_at, created_at';

export async function getCommentsForAgent(
  supabase: SupabaseClient,
  agentId: string,
  limit = 50
): Promise<AgentComment[]> {
  const { data } = await supabase
    .from('comments')
    .select(COLUMNS)
    .eq('agent_id', agentId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  return (data ?? []).map(rowToComment);
}
