import type { SupabaseClient } from '@supabase/supabase-js';

export type Mentee = {
  username: string;
  addedBy: string | null;
  addedAt: string;
};

type Row = {
  username: string;
  added_by: string | null;
  added_at: string;
};

export async function listMentees(
  supabase: SupabaseClient
): Promise<Mentee[]> {
  const { data, error } = await supabase.rpc('list_mentees');
  if (error) throw error;
  return ((data as Row[]) ?? []).map((r) => ({
    username: r.username,
    addedBy: r.added_by,
    addedAt: r.added_at,
  }));
}

export async function addMentee(
  supabase: SupabaseClient,
  username: string
): Promise<void> {
  const { error } = await supabase.rpc('add_mentee', { p_username: username });
  if (error) throw error;
}

export async function removeMentee(
  supabase: SupabaseClient,
  username: string
): Promise<void> {
  const { error } = await supabase.rpc('remove_mentee', {
    p_username: username,
  });
  if (error) throw error;
}
