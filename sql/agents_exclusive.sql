-- =====================================================================
-- Exclusive (mentee-only) community agents — "FOMO" model
--
-- Exclusive agents stay VISIBLE in the public listing (name, description,
-- category, tags) to drive demand, but their CONTENT is protected: only
-- allowlisted mentees and admins can read it. Everyone else hits a paywall
-- on the detail page.
--
-- Reuses the `mentees` allowlist and `_is_current_user_mentee()` helper
-- created by sql/prompts_exclusive.sql, and the existing `is_admin()`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. audience column
-- ---------------------------------------------------------------------
alter table community_agents
  add column if not exists audience text not null default 'public'
  check (audience in ('public', 'mentees'));

-- ---------------------------------------------------------------------
-- 2. RLS: the existing "public reads approved" policy leaks exclusive
--    content to anon. Restrict public reads to public agents, and add a
--    mentee read path for exclusive ones. (admin/author policies stay.)
-- ---------------------------------------------------------------------
drop policy if exists "public reads approved" on community_agents;
create policy "public reads approved"
  on community_agents for select
  to public
  using (
    status = 'approved'
    and deleted_at is null
    and audience = 'public'
  );

drop policy if exists "mentee reads exclusive" on community_agents;
create policy "mentee reads exclusive"
  on community_agents for select
  to public
  using (
    status = 'approved'
    and deleted_at is null
    and audience = 'mentees'
    and _is_current_user_mentee()
  );

-- ---------------------------------------------------------------------
-- 3. Listing/card source that bypasses RLS but MASKS the content of
--    exclusive agents. Lets the public (anon, cached) listing show
--    exclusive agents' metadata for FOMO without ever exposing content.
--    Pass p_slug = null for the full listing, or a slug for one card
--    (used by the detail paywall to show name/description, no content).
-- ---------------------------------------------------------------------
create or replace function approved_agent_cards(p_slug text)
returns table (
  id uuid,
  slug text,
  name text,
  description text,
  category text,
  category_label text,
  version text,
  tags text[],
  content text,
  status text,
  rejection_reason text,
  user_id uuid,
  author_username text,
  author_avatar_url text,
  created_at timestamptz,
  updated_at timestamptz,
  audience text
)
language sql
security definer
stable
as $fn$
  select
    id,
    slug::text,
    name::text,
    description::text,
    category::text,
    category_label::text,
    version::text,
    tags,
    case when audience = 'mentees' then '' else content end as content,
    status::text,
    rejection_reason::text,
    user_id,
    author_username::text,
    author_avatar_url::text,
    created_at,
    updated_at,
    audience::text
  from community_agents
  where status = 'approved'
    and deleted_at is null
    and (p_slug is null or slug = p_slug)
  order by created_at desc;
$fn$;

grant execute on function approved_agent_cards(text) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. admin toggle: flip an agent's audience
-- ---------------------------------------------------------------------
create or replace function set_agent_audience(p_id uuid, p_audience text)
returns void
language plpgsql
security definer
as $body$
begin
  if not is_admin() then
    raise exception 'Not authorized';
  end if;
  if p_audience not in ('public', 'mentees') then
    raise exception 'Invalid audience';
  end if;
  -- Deliberately does not touch updated_at, so flipping visibility does
  -- not look like a content edit (version history, "Updated" badge).
  update community_agents set audience = p_audience where id = p_id;
end;
$body$;

grant execute on function set_agent_audience(uuid, text) to authenticated;

notify pgrst, 'reload schema';
