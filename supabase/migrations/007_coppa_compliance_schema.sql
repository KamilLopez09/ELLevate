-- COPPA compliance: minimize PII stored for minors.
-- Intake table holds only first name, last initial, and age bracket.

create table if not exists public.camper_intake (
  id uuid primary key default gen_random_uuid(),
  first_name varchar(80) not null check (char_length(first_name) between 1 and 80),
  last_initial varchar(1) not null check (last_initial ~ '^[A-Z]$'),
  age_bracket varchar(10) not null check (age_bracket in ('5-9', '10-14')),
  created_at timestamptz not null default now()
);

-- Remove prohibited PII columns if a legacy intake table existed.
alter table public.camper_intake drop column if exists last_name;
alter table public.camper_intake drop column if exists email;
alter table public.camper_intake drop column if exists date_of_birth;

alter table public.camper_intake enable row level security;

revoke all on table public.camper_intake from anon, authenticated;
grant insert on table public.camper_intake to anon, authenticated;

drop policy if exists "deny_select_camper_intake" on public.camper_intake;
drop policy if exists "deny_update_camper_intake" on public.camper_intake;
drop policy if exists "deny_delete_camper_intake" on public.camper_intake;
drop policy if exists "anon_insert_camper_intake" on public.camper_intake;
drop policy if exists "authenticated_insert_camper_intake" on public.camper_intake;

create policy "deny_select_camper_intake"
  on public.camper_intake
  as restrictive
  for select
  to anon, authenticated
  using (false);

create policy "deny_update_camper_intake"
  on public.camper_intake
  as restrictive
  for update
  to anon, authenticated
  using (false)
  with check (false);

create policy "deny_delete_camper_intake"
  on public.camper_intake
  as restrictive
  for delete
  to anon, authenticated
  using (false);

create policy "anon_insert_camper_intake"
  on public.camper_intake
  for insert
  to anon
  with check (
    char_length(first_name) between 1 and 80
    and last_initial ~ '^[A-Z]$'
    and age_bracket in ('5-9', '10-14')
  );

create policy "authenticated_insert_camper_intake"
  on public.camper_intake
  for insert
  to authenticated
  with check (
    char_length(first_name) between 1 and 80
    and last_initial ~ '^[A-Z]$'
    and age_bracket in ('5-9', '10-14')
  );

-- Align telemetry with COPPA: replace display_name with first_name + last_initial.
alter table public.camper_telemetry
  add column if not exists first_name varchar(80),
  add column if not exists last_initial varchar(1);

update public.camper_telemetry
set
  first_name = coalesce(
    nullif(trim(split_part(display_name, ' ', 1)), ''),
    'Camper'
  ),
  last_initial = coalesce(
    nullif(
      upper(substring(trim(split_part(display_name, ' ', 2)) from 1 for 1)),
      ''
    ),
    'X'
  )
where first_name is null
   or last_initial is null;

alter table public.camper_telemetry
  alter column first_name set not null,
  alter column last_initial set not null;

alter table public.camper_telemetry
  drop constraint if exists camper_telemetry_display_name_check;

-- Drop insert policies before removing display_name (006 policies reference it).
drop policy if exists "anon_insert_camper_telemetry" on public.camper_telemetry;
drop policy if exists "authenticated_insert_camper_telemetry" on public.camper_telemetry;

alter table public.camper_telemetry
  drop column if exists display_name;

alter table public.camper_telemetry
  drop constraint if exists camper_telemetry_first_name_check;

alter table public.camper_telemetry
  add constraint camper_telemetry_first_name_check
  check (char_length(first_name) between 1 and 80);

alter table public.camper_telemetry
  drop constraint if exists camper_telemetry_last_initial_check;

alter table public.camper_telemetry
  add constraint camper_telemetry_last_initial_check
  check (last_initial ~ '^[A-Z]$');

-- Recreate telemetry insert policies with COPPA-safe columns.
drop policy if exists "anon_insert_camper_telemetry" on public.camper_telemetry;
drop policy if exists "authenticated_insert_camper_telemetry" on public.camper_telemetry;

create policy "anon_insert_camper_telemetry"
  on public.camper_telemetry
  for insert
  to anon
  with check (
    module_name = 'sentence_canvas'
    and score between 0 and 10
    and error_count >= 0
    and game_mode in (
      'flashcard_drill',
      'match_blitz',
      'sentence_builder',
      'rapid_fire'
    )
    and base_points >= 0
    and first_try_bonus >= 0
    and speed_bonus >= 0
    and total_points >= 0
    and total_points <= 1300
    and cumulative_score >= 0
    and speed_bonuses_earned >= 0
    and accuracy_rate >= 0
    and accuracy_rate <= 100
    and week_number between 1 and 8
    and correct_first_try between 0 and 10
    and char_length(camper_id) between 1 and 64
    and char_length(first_name) between 1 and 80
    and last_initial ~ '^[A-Z]$'
    and age_bracket in ('5-9', '10-14')
    and native_language in ('English', 'Spanish')
    and group_letter ~ '^[A-Z]$'
  );

create policy "authenticated_insert_camper_telemetry"
  on public.camper_telemetry
  for insert
  to authenticated
  with check (
    module_name = 'sentence_canvas'
    and score between 0 and 10
    and error_count >= 0
    and game_mode in (
      'flashcard_drill',
      'match_blitz',
      'sentence_builder',
      'rapid_fire'
    )
    and base_points >= 0
    and first_try_bonus >= 0
    and speed_bonus >= 0
    and total_points >= 0
    and total_points <= 1300
    and cumulative_score >= 0
    and speed_bonuses_earned >= 0
    and accuracy_rate >= 0
    and accuracy_rate <= 100
    and week_number between 1 and 8
    and correct_first_try between 0 and 10
    and char_length(camper_id) between 1 and 64
    and char_length(first_name) between 1 and 80
    and last_initial ~ '^[A-Z]$'
    and age_bracket in ('5-9', '10-14')
    and native_language in ('English', 'Spanish')
    and group_letter ~ '^[A-Z]$'
  );
