-- Gamification stats for camper telemetry (idempotent).

alter table public.camper_telemetry
  add column if not exists cumulative_score integer,
  add column if not exists speed_bonuses_earned integer,
  add column if not exists accuracy_rate decimal(5, 2);

update public.camper_telemetry
  set cumulative_score = coalesce(cumulative_score, 0),
      speed_bonuses_earned = coalesce(speed_bonuses_earned, 0),
      accuracy_rate = coalesce(accuracy_rate, 0)
  where cumulative_score is null
     or speed_bonuses_earned is null
     or accuracy_rate is null;

alter table public.camper_telemetry
  alter column cumulative_score set default 0,
  alter column speed_bonuses_earned set default 0,
  alter column accuracy_rate set default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_cumulative_score_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_cumulative_score_check
      check (cumulative_score >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_speed_bonuses_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_speed_bonuses_check
      check (speed_bonuses_earned >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_accuracy_rate_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_accuracy_rate_check
      check (accuracy_rate >= 0 and accuracy_rate <= 100);
  end if;
end $$;

drop policy if exists "anon_insert_camper_telemetry" on public.camper_telemetry;

create policy "anon_insert_camper_telemetry"
  on public.camper_telemetry
  for insert
  to anon
  with check (
    module_name = 'sentence_canvas'
    and score between 0 and 10
    and error_count >= 0
    and cumulative_score >= 0
    and speed_bonuses_earned >= 0
    and accuracy_rate >= 0
    and accuracy_rate <= 100
    and char_length(camper_id) between 1 and 64
    and char_length(display_name) between 1 and 80
    and age_bracket in ('5-7', '8-10', '11-14')
    and native_language in ('English', 'Spanish')
    and group_letter ~ '^[A-Z]$'
  );
