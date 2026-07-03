-- Remote curriculum revisions (Batch G4).
-- Content is published by organizers via curriculum-publish Edge Function only.

create table if not exists public.curriculum_revisions (
  id uuid primary key default gen_random_uuid(),
  revision_tag text not null,
  content jsonb not null,
  published_at timestamptz not null default now(),
  published_by text,
  is_active boolean not null default false
);

create unique index if not exists curriculum_revisions_one_active
  on public.curriculum_revisions (is_active)
  where is_active = true;

create index if not exists curriculum_revisions_published_at
  on public.curriculum_revisions (published_at desc);

alter table public.curriculum_revisions enable row level security;

create policy "deny anon curriculum_revisions"
  on public.curriculum_revisions
  as restrictive
  for all
  to anon
  using (false)
  with check (false);

create policy "deny authenticated curriculum_revisions"
  on public.curriculum_revisions
  as restrictive
  for all
  to authenticated
  using (false)
  with check (false);

revoke all on public.curriculum_revisions from anon, authenticated;

-- Atomic activation: deactivate prior revision only when the new row exists.
create or replace function public.activate_curriculum_revision(new_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.curriculum_revisions where id = new_id) then
    raise exception 'revision not found';
  end if;

  update public.curriculum_revisions
  set is_active = false
  where is_active = true;

  update public.curriculum_revisions
  set is_active = true
  where id = new_id;
end;
$$;

revoke all on function public.activate_curriculum_revision(uuid) from public;
grant execute on function public.activate_curriculum_revision(uuid) to service_role;
