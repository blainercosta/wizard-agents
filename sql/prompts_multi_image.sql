-- =====================================================================
-- Multi-image support + how-to-use guide + optional description
-- =====================================================================

-- Add new columns
alter table prompts add column if not exists how_to_use text;
alter table prompts add column if not exists images jsonb not null default '[]'::jsonb;

-- Migrate existing single image into the new images array
update prompts
set images = jsonb_build_array(
  jsonb_build_object(
    'url', reference_image_url,
    'alt', coalesce(reference_image_alt, '')
  )
)
where reference_image_url is not null
  and (images is null or images = '[]'::jsonb);

-- Drop legacy columns now that data is migrated
alter table prompts drop column if exists reference_image_url;
alter table prompts drop column if exists reference_image_alt;

-- =====================================================================
-- RPCs: recreate with new signatures
-- =====================================================================

drop function if exists create_prompt(text, text, text, text, text, text, text, text[]);
drop function if exists update_prompt(uuid, text, text, text, text, text, text, text[]);

create or replace function create_prompt(
  p_slug text,
  p_title text,
  p_description text,
  p_content text,
  p_format text,
  p_images jsonb,
  p_tags text[],
  p_how_to_use text
) returns uuid
language plpgsql
security definer
as $body$
declare
  new_id uuid;
begin
  if not _is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  insert into prompts (
    slug, title, description, content, format,
    images, tags, how_to_use
  ) values (
    p_slug, p_title, coalesce(p_description, ''), p_content, p_format,
    coalesce(p_images, '[]'::jsonb), coalesce(p_tags, '{}'), p_how_to_use
  )
  returning id into new_id;

  return new_id;
end;
$body$;

create or replace function update_prompt(
  p_id uuid,
  p_title text,
  p_description text,
  p_content text,
  p_format text,
  p_images jsonb,
  p_tags text[],
  p_how_to_use text
) returns void
language plpgsql
security definer
as $body$
begin
  if not _is_current_user_admin() then
    raise exception 'Not authorized';
  end if;

  update prompts
  set
    title = p_title,
    description = coalesce(p_description, ''),
    content = p_content,
    format = p_format,
    images = coalesce(p_images, '[]'::jsonb),
    tags = coalesce(p_tags, '{}'),
    how_to_use = p_how_to_use,
    updated_at = now()
  where id = p_id;
end;
$body$;

grant execute on function create_prompt(text, text, text, text, text, jsonb, text[], text) to authenticated;
grant execute on function update_prompt(uuid, text, text, text, text, jsonb, text[], text) to authenticated;

notify pgrst, 'reload schema';
