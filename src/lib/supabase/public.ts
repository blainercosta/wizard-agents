import { createClient } from '@supabase/supabase-js';

// Anon client without cookie binding for cached public reads. Approved
// community_agents are publicly readable per RLS, so this can be called
// from unstable_cache'd functions that run outside request context.
export const publicSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
