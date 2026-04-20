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
  parentId: string | null;
  likeCount: number;
  likedByMe: boolean;
  replies: AgentComment[];
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
  parent_id: string | null;
};

function rowToComment(row: Row): Omit<AgentComment, 'likeCount' | 'likedByMe' | 'replies'> {
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
    parentId: row.parent_id,
  };
}

const COLUMNS =
  'id, user_id, github_username, github_avatar_url, body, kind, resolved, resolved_reply, resolved_at, created_at, parent_id';

export async function getCommentsForAgent(
  supabase: SupabaseClient,
  agentId: string,
  currentUserId: string | null = null,
  topLevelLimit = 50
): Promise<AgentComment[]> {
  const { data: rows } = await supabase
    .from('comments')
    .select(COLUMNS)
    .eq('agent_id', agentId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (!rows || rows.length === 0) return [];

  const ids = rows.map((r) => r.id);

  const [likesRes, myLikesRes] = await Promise.all([
    supabase.from('comment_likes').select('comment_id').in('comment_id', ids),
    currentUserId
      ? supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', currentUserId)
          .in('comment_id', ids)
      : Promise.resolve({ data: [] as { comment_id: string }[] }),
  ]);

  const likeCounts = new Map<string, number>();
  for (const l of likesRes.data ?? []) {
    likeCounts.set(l.comment_id, (likeCounts.get(l.comment_id) ?? 0) + 1);
  }

  const myLikes = new Set<string>();
  for (const l of myLikesRes.data ?? []) myLikes.add(l.comment_id);

  const enriched: AgentComment[] = rows.map((r) => ({
    ...rowToComment(r),
    likeCount: likeCounts.get(r.id) ?? 0,
    likedByMe: myLikes.has(r.id),
    replies: [],
  }));

  const byId = new Map(enriched.map((c) => [c.id, c]));
  const topLevel: AgentComment[] = [];
  for (const c of enriched) {
    if (c.parentId) {
      const parent = byId.get(c.parentId);
      if (parent) parent.replies.push(c);
      // Orphan reply (parent deleted) — skip
    } else {
      topLevel.push(c);
    }
  }

  // Top-level shown most-recent first; replies stay chronological within a thread.
  topLevel.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return topLevel.slice(0, topLevelLimit);
}
