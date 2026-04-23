-- Add update_prompt RPC (mirrors create_prompt, admin-gated).
-- Slug is intentionally NOT updatable to preserve share links.

create or replace function update_prompt(
  p_id uuid,
  p_title text,
  p_description text,
  p_content text,
  p_format text,
  p_reference_image_url text,
  p_reference_image_alt text,
  p_tags text[]
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
    description = p_description,
    content = p_content,
    format = p_format,
    reference_image_url = p_reference_image_url,
    reference_image_alt = p_reference_image_alt,
    tags = coalesce(p_tags, '{}'),
    updated_at = now()
  where id = p_id;
end;
$body$;

grant execute on function update_prompt(uuid, text, text, text, text, text, text, text[]) to authenticated;

notify pgrst, 'reload schema';
