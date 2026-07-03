-- F1: Realtime Authorization for organizer camp wall (private broadcast channel).
--
-- After applying this migration, disable "Allow public access" under
-- Project Settings → Realtime so private channels are enforced.

alter table realtime.messages enable row level security;

drop policy if exists "organizer_wall_read_broadcast" on realtime.messages;

create policy "organizer_wall_read_broadcast"
on realtime.messages
for select
to authenticated
using (
  extension = 'broadcast'
  and realtime.topic() = coalesce(
    current_setting('request.jwt.claims', true)::json ->> 'wall_topic',
    ''
  )
);

-- No INSERT policy for authenticated: campers cannot publish to the wall.
-- Service role (camper-telemetry broadcast) bypasses RLS.
