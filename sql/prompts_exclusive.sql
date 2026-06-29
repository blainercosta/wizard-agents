-- =====================================================================
-- Exclusive (mentee-only) prompts
--
-- Adds an `audience` gate to prompts and a `mentees` allowlist keyed by
-- GitHub username. Public prompts behave exactly as before. Exclusive
-- prompts (audience = 'mentees') are readable only by allowlisted users
-- and admins.
--
-- Identity: mentees are matched by GitHub login (auth user_metadata
-- user_name), so an admin can add someone by @username before they ever
-- sign in. Admins are still matched by numeric github_user_id (admins
-- table), unchanged.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. audience column on prompts
-- ---------------------------------------------------------------------
alter table prompts
  add column if not exists audience text not null default 'public'
  check (audience in ('public', 'mentees'));

create index if not exists idx_prompts_audience
  on prompts (audience) where published_at is not null;

-- ---------------------------------------------------------------------
-- 2. mentees allowlist (keyed by lowercased GitHub username)
-- ---------------------------------------------------------------------
create table if not exists mentees (
  username text primary key,
  added_by text,
  added_at timestamptz not null default now()
);

alter table mentees enable row level security;

-- Only admins may read the allowlist directly. Writes go through RPCs.
drop policy if exists "admin read mentees" on mentees;
create policy "admin read mentees"
  on mentees for select
  using (
    exists (
      select 1 from admins
      where github_user_id = (
        (auth.jwt() -> 'user_metadata' ->> 'provider_id')::bigint
      )
    )
  );

-- ---------------------------------------------------------------------
-- 3. helper: is the current user an allowlisted mentee?
-- ---------------------------------------------------------------------
create or replace function _is_current_user_mentee()
returns boolean
language sql
stable
as $fn$
  select exists (
    select 1 from mentees
    where username = lower(auth.jwt() -> 'user_metadata' ->> 'user_name')
  );
$fn$;

-- ---------------------------------------------------------------------
-- 4. RLS: restrict public reads to public prompts; let mentees read
--    exclusive ones. (admin read all policy already covers admins.)
-- ---------------------------------------------------------------------
drop policy if exists "public read published" on prompts;
create policy "public read published"
  on prompts for select
  using (published_at is not null and audience = 'public');

drop policy if exists "mentee read exclusive" on prompts;
create policy "mentee read exclusive"
  on prompts for select
  using (
    published_at is not null
    and audience = 'mentees'
    and _is_current_user_mentee()
  );

-- ---------------------------------------------------------------------
-- 5. audience lookup that bypasses RLS, so the app can tell
--    "not found" apart from "exists but you can't see it" (gate vs 404).
--    Returns the audience of a published prompt, or null if none.
-- ---------------------------------------------------------------------
create or replace function published_prompt_audience(p_slug text)
returns text
language sql
security definer
stable
as $fn$
  select audience from prompts
  where slug = p_slug and published_at is not null
  limit 1;
$fn$;

grant execute on function published_prompt_audience(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 6. recreate create_prompt / update_prompt with the audience param
-- ---------------------------------------------------------------------
drop function if exists create_prompt(text, text, text, text, text, jsonb, text[], text);
drop function if exists update_prompt(uuid, text, text, text, text, jsonb, text[], text);

create or replace function create_prompt(
  p_slug text,
  p_title text,
  p_description text,
  p_content text,
  p_format text,
  p_images jsonb,
  p_tags text[],
  p_how_to_use text,
  p_audience text
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
    images, tags, how_to_use, audience
  ) values (
    p_slug, p_title, coalesce(p_description, ''), p_content, p_format,
    coalesce(p_images, '[]'::jsonb), coalesce(p_tags, '{}'), p_how_to_use,
    coalesce(nullif(p_audience, ''), 'public')
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
  p_how_to_use text,
  p_audience text
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
    audience = coalesce(nullif(p_audience, ''), 'public'),
    updated_at = now()
  where id = p_id;
end;
$body$;

grant execute on function create_prompt(text, text, text, text, text, jsonb, text[], text, text) to authenticated;
grant execute on function update_prompt(uuid, text, text, text, text, jsonb, text[], text, text) to authenticated;

-- ---------------------------------------------------------------------
-- 7. mentee management RPCs (admin-gated)
-- ---------------------------------------------------------------------
create or replace function add_mentee(p_username text)
returns void
language plpgsql
security definer
as $body$
declare
  v_username text := lower(trim(both '@' from coalesce(p_username, '')));
  v_admin text;
begin
  if not _is_current_user_admin() then
    raise exception 'Not authorized';
  end if;
  if v_username = '' then
    raise exception 'Username is required';
  end if;

  v_admin := lower(auth.jwt() -> 'user_metadata' ->> 'user_name');

  insert into mentees (username, added_by)
  values (v_username, v_admin)
  on conflict (username) do nothing;
end;
$body$;

create or replace function remove_mentee(p_username text)
returns void
language plpgsql
security definer
as $body$
begin
  if not _is_current_user_admin() then
    raise exception 'Not authorized';
  end if;
  delete from mentees where username = lower(trim(both '@' from coalesce(p_username, '')));
end;
$body$;

create or replace function list_mentees()
returns setof mentees
language plpgsql
security definer
stable
as $body$
begin
  if not _is_current_user_admin() then
    raise exception 'Not authorized';
  end if;
  return query select * from mentees order by added_at desc;
end;
$body$;

grant execute on function add_mentee(text) to authenticated;
grant execute on function remove_mentee(text) to authenticated;
grant execute on function list_mentees() to authenticated;

notify pgrst, 'reload schema';
