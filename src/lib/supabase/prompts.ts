import type { SupabaseClient } from '@supabase/supabase-js';
import type { Prompt, PromptImage } from '@/types/prompt';

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  format: 'text' | 'json';
  images: PromptImage[] | null;
  how_to_use: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  'id, slug, title, description, content, format, images, how_to_use, tags, published_at, created_at, updated_at';

function rowToPrompt(row: Row): Prompt {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description ?? '',
    content: row.content,
    format: row.format,
    images: Array.isArray(row.images) ? row.images : [],
    howToUse: row.how_to_use,
    tags: row.tags ?? [],
    publishedAt: row.published_at ?? row.created_at,
  };
}

export async function getPublishedPromptBySlug(
  supabase: SupabaseClient,
  slug: string
): Promise<Prompt | null> {
  const { data } = await supabase
    .from('prompts')
    .select(COLUMNS)
    .eq('slug', slug)
    .not('published_at', 'is', null)
    .maybeSingle();

  return data ? rowToPrompt(data as Row) : null;
}

export async function getAllPublishedPrompts(
  supabase: SupabaseClient
): Promise<Prompt[]> {
  const { data } = await supabase
    .from('prompts')
    .select(COLUMNS)
    .not('published_at', 'is', null)
    .order('created_at', { ascending: false });

  return (data ?? []).map((r) => rowToPrompt(r as Row));
}

export async function getAllPromptsForAdmin(
  supabase: SupabaseClient
): Promise<Array<Prompt & { id: string }>> {
  const { data } = await supabase
    .from('prompts')
    .select(COLUMNS)
    .order('created_at', { ascending: false });

  return (data ?? []).map((r) => {
    const row = r as Row;
    return { ...rowToPrompt(row), id: row.id };
  });
}

export async function getPromptByIdForAdmin(
  supabase: SupabaseClient,
  id: string
): Promise<(Prompt & { id: string }) | null> {
  const { data } = await supabase
    .from('prompts')
    .select(COLUMNS)
    .eq('id', id)
    .maybeSingle();

  if (!data) return null;
  const row = data as Row;
  return { ...rowToPrompt(row), id: row.id };
}

type PromptInput = {
  slug: string;
  title: string;
  description: string;
  content: string;
  format: 'text' | 'json';
  images: PromptImage[];
  howToUse: string | null;
  tags: string[];
};

export async function createPrompt(
  supabase: SupabaseClient,
  input: PromptInput
): Promise<string> {
  const { data, error } = await supabase.rpc('create_prompt', {
    p_slug: input.slug,
    p_title: input.title,
    p_description: input.description,
    p_content: input.content,
    p_format: input.format,
    p_images: input.images,
    p_tags: input.tags,
    p_how_to_use: input.howToUse,
  });
  if (error) throw error;
  return data as string;
}

export async function updatePrompt(
  supabase: SupabaseClient,
  id: string,
  input: Omit<PromptInput, 'slug'>
): Promise<void> {
  const { error } = await supabase.rpc('update_prompt', {
    p_id: id,
    p_title: input.title,
    p_description: input.description,
    p_content: input.content,
    p_format: input.format,
    p_images: input.images,
    p_tags: input.tags,
    p_how_to_use: input.howToUse,
  });
  if (error) throw error;
}

export async function deletePrompt(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.rpc('delete_prompt', { p_id: id });
  if (error) throw error;
}

export async function uploadPromptImage(
  supabase: SupabaseClient,
  slug: string,
  file: File
): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'png';
  const path = `${slug}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from('prompt-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('prompt-images').getPublicUrl(path);
  return data.publicUrl;
}
