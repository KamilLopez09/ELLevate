create table public.camper_telemetry (
  id uuid primary key default gen_random_uuid(),
  module_name text not null check (char_length(module_name) <= 64),
  score integer not null check (score >= 0 and score <= 5),
  error_count integer not null check (error_count >= 0),
  camper_id text not null check (char_length(camper_id) between 1 and 64),
  display_name text not null check (char_length(display_name) between 1 and 80),
  age_bracket text not null check (age_bracket in ('5-7', '8-10', '11-14')),
  native_language text not null check (native_language in ('English', 'Spanish')),
  group_letter text not null check (group_letter ~ '^[A-Z]$'),
  completed_at timestamptz not null default now()
);

alter table public.camper_telemetry enable row level security;

create policy "anon_insert_camper_telemetry"
  on public.camper_telemetry
  for insert
  to anon
  with check (
    module_name = 'sentence_canvas'
    and score between 0 and 5
    and error_count >= 0
    and char_length(camper_id) between 1 and 64
    and char_length(display_name) between 1 and 80
    and age_bracket in ('5-7', '8-10', '11-14')
    and native_language in ('English', 'Spanish')
    and group_letter ~ '^[A-Z]$'
  );
