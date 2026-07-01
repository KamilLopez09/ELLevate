-- V1.1 security: route telemetry writes through the camper-telemetry Edge Function.
--
-- Campers previously INSERTed into camper_telemetry directly with the anon key
-- (validated only by RLS check constraints). Writes now go through the
-- camper-telemetry Edge Function, which validates the payload and inserts with
-- the service role key. This migration removes the direct client write path so
-- the anon/authenticated roles can no longer touch the table at all.
--
-- The service role bypasses RLS and table grants, so the Edge Function insert
-- continues to work. The deny SELECT/UPDATE/DELETE policies from 006 remain.

-- Drop the client-facing insert policies (no longer needed).
drop policy if exists "anon_insert_camper_telemetry" on public.camper_telemetry;
drop policy if exists "authenticated_insert_camper_telemetry" on public.camper_telemetry;

-- Revoke the direct INSERT privilege from client roles.
revoke insert on table public.camper_telemetry from anon, authenticated;

-- Explicit deny INSERT policy (defense in depth alongside the revoked grant).
drop policy if exists "deny_insert_camper_telemetry" on public.camper_telemetry;
create policy "deny_insert_camper_telemetry"
  on public.camper_telemetry
  as restrictive
  for insert
  to anon, authenticated
  with check (false);
