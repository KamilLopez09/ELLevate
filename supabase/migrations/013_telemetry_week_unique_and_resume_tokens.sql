-- E1: one telemetry pass row per camper per week (keep earliest pass).
delete from public.camper_telemetry a
using public.camper_telemetry b
where a.camper_id = b.camper_id
  and a.week_number = b.week_number
  and a.completed_at > b.completed_at;

create unique index if not exists camper_telemetry_camper_week_unique
  on public.camper_telemetry (camper_id, week_number);

-- E3: single-use resume create attestation tokens (service role only).
create table if not exists public.camper_resume_spent_tokens (
  token_hash text primary key check (char_length(token_hash) = 64),
  spent_at timestamptz not null default now()
);

alter table public.camper_resume_spent_tokens enable row level security;

revoke all on public.camper_resume_spent_tokens from anon, authenticated;
grant all on public.camper_resume_spent_tokens to service_role;
