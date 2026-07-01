/**
 * Supabase connection config for the static client.
 *
 * The browser never opens a direct database connection: telemetry writes go
 * through the `camper-telemetry` Edge Function and organizer reads through
 * `organizer-telemetry`, both called with `fetch` using this public config.
 */
export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}
