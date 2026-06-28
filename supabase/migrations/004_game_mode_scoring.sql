-- Align camper_telemetry with per-game-mode scoring breakdown.

alter table public.camper_telemetry
  add column if not exists game_mode text,
  add column if not exists base_points integer,
  add column if not exists first_try_bonus integer,
  add column if not exists speed_bonus integer,
  add column if not exists total_points integer,
  add column if not exists week_number integer,
  add column if not exists correct_first_try integer;

update public.camper_telemetry
  set game_mode = coalesce(game_mode, 'sentence_builder'),
      base_points = coalesce(base_points, 0),
      first_try_bonus = coalesce(first_try_bonus, 0),
      speed_bonus = coalesce(speed_bonus, coalesce(speed_bonuses_earned, 0)),
      total_points = coalesce(total_points, coalesce(cumulative_score, score, 0)),
      week_number = coalesce(week_number, 1),
      correct_first_try = coalesce(correct_first_try, score, 0)
  where game_mode is null
     or base_points is null
     or first_try_bonus is null
     or speed_bonus is null
     or total_points is null
     or week_number is null
     or correct_first_try is null;

alter table public.camper_telemetry
  alter column base_points set default 0,
  alter column first_try_bonus set default 0,
  alter column speed_bonus set default 0,
  alter column total_points set default 0,
  alter column week_number set default 1,
  alter column correct_first_try set default 0;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_game_mode_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_game_mode_check
      check (game_mode in (
        'flashcard_drill',
        'match_blitz',
        'sentence_builder',
        'rapid_fire'
      ));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_base_points_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_base_points_check
      check (base_points >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_first_try_bonus_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_first_try_bonus_check
      check (first_try_bonus >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_speed_bonus_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_speed_bonus_check
      check (speed_bonus >= 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_total_points_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_total_points_check
      check (total_points >= 0 and total_points <= 1300);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_week_number_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_week_number_check
      check (week_number between 1 and 8);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_correct_first_try_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_correct_first_try_check
      check (correct_first_try between 0 and 10);
  end if;
end $$;

-- Relax legacy score column; correct_first_try is the canonical accuracy count.
alter table public.camper_telemetry drop constraint if exists camper_telemetry_score_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_score_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_score_check
      check (score between 0 and 10);
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
    and age_bracket in ('5-7', '8-10', '11-14')
    and native_language in ('English', 'Spanish')
    and group_letter ~ '^[A-Z]$'
  );
