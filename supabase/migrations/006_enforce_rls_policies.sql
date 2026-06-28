-- V1.0 security: camper_telemetry is append-only for client roles.
-- Campers may INSERT their own rows; SELECT, UPDATE, and DELETE are denied.

alter table public.camper_telemetry enable row level security;

-- Remove any legacy read/write policies.
drop policy if exists "anon_select_camper_telemetry" on public.camper_telemetry;
drop policy if exists "authenticated_select_camper_telemetry" on public.camper_telemetry;
drop policy if exists "anon_update_camper_telemetry" on public.camper_telemetry;
drop policy if exists "authenticated_update_camper_telemetry" on public.camper_telemetry;
drop policy if exists "anon_delete_camper_telemetry" on public.camper_telemetry;
drop policy if exists "authenticated_delete_camper_telemetry" on public.camper_telemetry;
drop policy if exists "deny_select_camper_telemetry" on public.camper_telemetry;
drop policy if exists "deny_update_camper_telemetry" on public.camper_telemetry;
drop policy if exists "deny_delete_camper_telemetry" on public.camper_telemetry;
drop policy if exists "anon_insert_camper_telemetry" on public.camper_telemetry;
drop policy if exists "authenticated_insert_camper_telemetry" on public.camper_telemetry;

-- Table privileges: INSERT only for client-facing roles.
revoke all on table public.camper_telemetry from anon, authenticated;
grant insert on table public.camper_telemetry to anon, authenticated;

-- Explicit deny policies (defense in depth when RLS is enabled).
create policy "deny_select_camper_telemetry"
  on public.camper_telemetry
  as restrictive
  for select
  to anon, authenticated
  using (false);

create policy "deny_update_camper_telemetry"
  on public.camper_telemetry
  as restrictive
  for update
  to anon, authenticated
  using (false)
  with check (false);

create policy "deny_delete_camper_telemetry"
  on public.camper_telemetry
  as restrictive
  for delete
  to anon, authenticated
  using (false);

-- Allow validated telemetry writes for anonymous and authenticated clients.
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
    and char_length(display_name) between 1 and 80
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
    and char_length(display_name) between 1 and 80
    and age_bracket in ('5-9', '10-14')
    and native_language in ('English', 'Spanish')
    and group_letter ~ '^[A-Z]$'
  );
