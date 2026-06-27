import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseConfig(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function createBrowserClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  if (!client) {
    client = createClient(config.url, config.key);
  }

  return client;
}
