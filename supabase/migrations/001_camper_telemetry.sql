create table public.camper_telemetry (
  id uuid primary key default gen_random_uuid(),
  module_name text not null check (char_length(module_name) <= 64),
  score integer not null check (score >= 0 and score <= 5),
  error_count integer not null check (error_count >= 0),
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
  );
