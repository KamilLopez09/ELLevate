-- Reorganize age brackets from 5-7 / 8-10 / 11-14 to 5-9 / 10-14.
-- Drop the old check first so row updates can use the new bracket values.

alter table public.camper_telemetry
  drop constraint if exists camper_telemetry_age_bracket_check;

update public.camper_telemetry
set age_bracket = case
  when age_bracket in ('5-7', '8-10') then '5-9'
  when age_bracket = '11-14' then '10-14'
  else age_bracket
end
where age_bracket in ('5-7', '8-10', '11-14');

alter table public.camper_telemetry
  add constraint camper_telemetry_age_bracket_check
  check (age_bracket in ('5-9', '10-14'));

drop policy if exists "anon_insert_camper_telemetry" on public.camper_telemetry;

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
