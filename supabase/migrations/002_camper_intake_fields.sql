-- Adds camper intake fields to telemetry. Idempotent: safe to run on a database
-- where 001 was applied before these columns existed.

alter table public.camper_telemetry
  add column if not exists camper_id text,
  add column if not exists age_bracket text,
  add column if not exists native_language text;

-- Backfill any pre-existing rows so the NOT NULL constraints can be applied.
update public.camper_telemetry
  set camper_id = coalesce(camper_id, 'unknown'),
      age_bracket = coalesce(age_bracket, '5-7'),
      native_language = coalesce(native_language, 'English')
  where camper_id is null
     or age_bracket is null
     or native_language is null;

alter table public.camper_telemetry
  alter column camper_id set not null,
  alter column age_bracket set not null,
  alter column native_language set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_camper_id_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_camper_id_check
      check (char_length(camper_id) between 1 and 64);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_age_bracket_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_age_bracket_check
      check (age_bracket in ('5-7', '8-10', '11-14'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'camper_telemetry_native_language_check'
  ) then
    alter table public.camper_telemetry
      add constraint camper_telemetry_native_language_check
      check (native_language in ('English', 'Spanish'));
  end if;
end $$;

-- Recreate the insert policy to validate the new fields.
drop policy if exists "anon_insert_camper_telemetry" on public.camper_telemetry;

create policy "anon_insert_camper_telemetry"
  on public.camper_telemetry
  for insert
  to anon
  with check (
    module_name = 'sentence_canvas'
    and score between 0 and 5
    and error_count >= 0
    and char_length(camper_id) between 1 and 64
    and age_bracket in ('5-7', '8-10', '11-14')
    and native_language in ('English', 'Spanish')
  );
