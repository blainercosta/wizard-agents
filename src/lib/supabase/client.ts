import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Cache the browser client per tab — creating it in every client component
// burns hydration time (cards have 2+ auth-aware client components each).
let instance: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (instance) return instance;
  instance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  return instance;
}
