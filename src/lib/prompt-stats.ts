import { publicSupabase } from './supabase/public';

export async function getCopyCount(slug: string): Promise<number> {
  const { data } = await publicSupabase
    .from('prompt_stats')
    .select('copy_count')
    .eq('slug', slug)
    .maybeSingle();
  return data?.copy_count ?? 0;
}

export async function incrementCopyCount(slug: string): Promise<number> {
  const { data, error } = await publicSupabase.rpc('increment_prompt_copy', {
    p_slug: slug,
  });
  if (error) throw error;
  return (data as number) ?? 0;
}
