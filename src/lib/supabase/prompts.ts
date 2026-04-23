import type { SupabaseClient } from '@supabase/supabase-js';
import type { Prompt } from '@/types/prompt';

type Row = {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  format: 'text' | 'json';
  reference_image_url: string | null;
  reference_image_alt: string | null;
  tags: string[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
};

const COLUMNS =
  'id, slug, title, description, content, format, reference_image_url, reference_image_alt, tags, published_at, created_at, updated_at';

function rowToPrompt(row: Row): Prompt {
  return {
    slug: row.slug,
    title: row.title,
    description: row.description,
    content: row.content,
    format: row.format,
    referenceImage: {
      src: row.reference_image_url ?? '',
      alt: row.reference_image_alt ?? '',
      width: 1200,
      height: 630,
    },
    tags: row.tags ?? [],
    publishedAt: row.published_at ?? row.created_at,
  };
}

export type AdminPromptRow = Row & { publishedAt: string | null };

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

export async function createPrompt(
  supabase: SupabaseClient,
  input: {
    slug: string;
    title: string;
    description: string;
    content: string;
    format: 'text' | 'json';
    referenceImageUrl: string | null;
    referenceImageAlt: string | null;
    tags: string[];
  }
): Promise<string> {
  const { data, error } = await supabase.rpc('create_prompt', {
    p_slug: input.slug,
    p_title: input.title,
    p_description: input.description,
    p_content: input.content,
    p_format: input.format,
    p_reference_image_url: input.referenceImageUrl,
    p_reference_image_alt: input.referenceImageAlt,
    p_tags: input.tags,
  });
  if (error) throw error;
  return data as string;
}

export async function updatePrompt(
  supabase: SupabaseClient,
  id: string,
  input: {
    title: string;
    description: string;
    content: string;
    format: 'text' | 'json';
    referenceImageUrl: string | null;
    referenceImageAlt: string | null;
    tags: string[];
  }
): Promise<void> {
  const { error } = await supabase.rpc('update_prompt', {
    p_id: id,
    p_title: input.title,
    p_description: input.description,
    p_content: input.content,
    p_format: input.format,
    p_reference_image_url: input.referenceImageUrl,
    p_reference_image_alt: input.referenceImageAlt,
    p_tags: input.tags,
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
  const path = `${slug}/${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from('prompt-images')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) throw error;

  const { data } = supabase.storage.from('prompt-images').getPublicUrl(path);
  return data.publicUrl;
}
