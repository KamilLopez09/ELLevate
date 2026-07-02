-- Lock down unused camper_intake table (app never writes here; intake stays in localStorage).
-- Migration 007 granted anon INSERT; this closes that unused attack surface.

drop policy if exists "anon_insert_camper_intake" on public.camper_intake;
drop policy if exists "authenticated_insert_camper_intake" on public.camper_intake;

revoke insert on table public.camper_intake from anon, authenticated;

drop policy if exists "deny_insert_camper_intake" on public.camper_intake;
create policy "deny_insert_camper_intake"
  on public.camper_intake
  as restrictive
  for insert
  to anon, authenticated
  with check (false);
