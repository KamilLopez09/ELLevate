import { getSupabaseConfig } from "@/lib/supabase/client";

export type EdgeFetchFailure =
  | { kind: "not_configured" }
  | { kind: "network" };

export function isEdgeFetchFailure(
  result: Response | EdgeFetchFailure,
): result is EdgeFetchFailure {
  return "kind" in result;
}

/** POST to a Supabase Edge Function using the public anon key. */
export async function postEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
): Promise<Response | EdgeFetchFailure> {
  const config = getSupabaseConfig();
  if (!config) {
    return { kind: "not_configured" };
  }

  try {
    return await fetch(`${config.url}/functions/v1/${functionName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        apikey: config.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return { kind: "network" };
  }
}
