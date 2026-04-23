create table if not exists prompt_stats (
  slug text primary key,
  copy_count bigint not null default 0,
  updated_at timestamptz not null default now()
);

alter table prompt_stats enable row level security;

drop policy if exists "public read" on prompt_stats;
create policy "public read" on prompt_stats
  for select using (true);

create or replace function increment_prompt_copy(p_slug text)
returns bigint
language plpgsql
security definer
as $body$
declare
  new_count bigint;
begin
  insert into prompt_stats (slug, copy_count)
  values (p_slug, 1)
  on conflict (slug) do update
    set copy_count = prompt_stats.copy_count + 1,
        updated_at = now()
  returning copy_count into new_count;
  return new_count;
end;
$body$;

grant execute on function increment_prompt_copy(text) to anon, authenticated;

notify pgrst, 'reload schema';
