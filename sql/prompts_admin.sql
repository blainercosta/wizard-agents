-- =====================================================================
-- prompts table: dynamic content replacing static content/prompts/*.json
-- =====================================================================

create table if not exists prompts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  description text not null,
  content text not null,
  format text not null default 'text' check (format in ('text', 'json')),
  reference_image_url text,
  reference_image_alt text,
  tags text[] not null default '{}',
  published_at timestamptz default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_prompts_slug_published
  on prompts (slug) where published_at is not null;

alter table prompts enable row level security;

-- Public can read published prompts. Matches the existing anon-key reads.
drop policy if exists "public read published" on prompts;
create policy "public read published"
  on prompts for select
  using (published_at is not null);

-- Admins can read everything (including drafts).
drop policy if exists "admin read all" on prompts;
create policy "admin read all"
  on prompts for select
  using (
    exists (
      select 1 from admins
      where github_user_id = (
        (auth.jwt() -> 'user_metadata' ->> 'provider_id')::bigint
      )
    )
  );

-- =====================================================================
-- Storage bucket for reference images
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('prompt-images', 'prompt-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public read prompt images" on storage.objects;
create policy "public read prompt images"
  on storage.objects for select
  using (bucket_id = 'prompt-images');

drop policy if exists "admin upload prompt images" on storage.objects;
create policy "admin upload prompt images"
  on storage.objects for insert
  with check (
    bucket_id = 'prompt-images'
    and exists (
      select 1 from admins
      where github_user_id = (
        (auth.jwt() -> 'user_metadata' ->> 'provider_id')::bigint
      )
    )
  );

drop policy if exists "admin delete prompt images" on storage.objects;
create policy "admin delete prompt images"
  on storage.objects for delete
  using (
    bucket_id = 'prompt-images'
    and exists (
      select 1 from admins
      where github_user_id = (
        (auth.jwt() -> 'user_metadata' ->> 'provider_id')::bigint
      )
    )
  );

-- =====================================================================
-- RPCs for mutations (security definer, admin-gated)
-- =====================================================================

create or replace function _is_current_user_admin()
returns boolean
language sql
stable
as $fn$
  select exists (
    select 1 from admins
    where github_user_id = (
      (auth.jwt() -> 'user_metadata' ->> 'provider_id')::bigint
    )
  );
$fn$;

create or replace function create_prompt(
  p_slug text,
  p_title text,
  p_description text,
  p_content text,
  p_format text,
  p_reference_image_url text,
  p_reference_image_alt text,
  p_tags text[]
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
    reference_image_url, reference_image_alt, tags
  ) values (
    p_slug, p_title, p_description, p_content, p_format,
    p_reference_image_url, p_reference_image_alt, coalesce(p_tags, '{}')
  )
  returning id into new_id;

  return new_id;
end;
$body$;

create or replace function delete_prompt(p_id uuid)
returns void
language plpgsql
security definer
as $body$
begin
  if not _is_current_user_admin() then
    raise exception 'Not authorized';
  end if;
  delete from prompts where id = p_id;
end;
$body$;

grant execute on function create_prompt(text, text, text, text, text, text, text, text[]) to authenticated;
grant execute on function delete_prompt(uuid) to authenticated;

notify pgrst, 'reload schema';
