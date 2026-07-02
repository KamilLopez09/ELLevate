-- Cross-device camp progress snapshots (Batch G1).
-- Clients never read/write this table directly; camper-resume Edge Function uses service role.

create table if not exists public.camper_resume_snapshots (
  id uuid primary key default gen_random_uuid(),
  resume_code text not null unique,
  camper_id text not null,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  lookup_count int not null default 0,
  constraint resume_code_format check (resume_code ~ '^[2-9A-HJ-NP-Z]{6}$')
);

create index if not exists camper_resume_code_idx
  on public.camper_resume_snapshots (resume_code);

create index if not exists camper_resume_expires_idx
  on public.camper_resume_snapshots (expires_at);

alter table public.camper_resume_snapshots enable row level security;

revoke all on table public.camper_resume_snapshots from anon, authenticated;
