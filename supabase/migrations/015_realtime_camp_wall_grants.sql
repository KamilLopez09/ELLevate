-- Ensure organizer JWT can pass Realtime Authorization RLS (migration 014).
-- Safe to re-run: policies and grants are idempotent.

grant usage on schema realtime to authenticated;
grant select on realtime.messages to authenticated;

drop policy if exists "organizer_wall_read_broadcast" on realtime.messages;

create policy "organizer_wall_read_broadcast"
on realtime.messages
for select
to authenticated
using (
  realtime.messages.extension = 'broadcast'
  and realtime.topic() = coalesce(
    auth.jwt() ->> 'wall_topic',
    current_setting('request.jwt.claims', true)::json ->> 'wall_topic',
    ''
  )
);
