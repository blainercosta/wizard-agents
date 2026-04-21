import posthog from 'posthog-js';

type EventMap = {
  agent_copied: { agent_id: string; agent_slug: string; source: 'grid' | 'detail' };
  agent_downloaded: { agent_id: string; agent_slug: string; source: 'grid' | 'detail' };
  agent_upvoted: { agent_id: string };
  agent_upvote_removed: { agent_id: string };
  bookmark_toggled: { agent_id: string; bookmarked: boolean };
  comment_posted: { agent_id: string; is_reply: boolean };
  comment_liked: { comment_id: string };
  submit_started: Record<string, never>;
  submit_submitted: Record<string, never>;
  sign_in_started: { source: string };
  filter_applied: { category: string; sort: string };
};

export function track<K extends keyof EventMap>(event: K, properties: EventMap[K]) {
  if (typeof window === 'undefined') return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
  posthog.capture(event, properties);
}
