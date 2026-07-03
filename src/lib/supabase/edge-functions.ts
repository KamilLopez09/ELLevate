import { getSupabaseConfig } from "@/lib/supabase/client";

export type EdgeFetchFailure =
  | { kind: "not_configured" }
  | { kind: "network" };

export function isEdgeFetchFailure(
  result: Response | EdgeFetchFailure,
): result is EdgeFetchFailure {
  return "kind" in result;
}

export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  "Camp servers are not set up on this site. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then redeploy.";

export const SUPABASE_NETWORK_MESSAGE =
  "Could not reach camp servers. Check Wi‑Fi and that Supabase Edge Functions are deployed.";

export function edgeFetchFailureMessage(failure: EdgeFetchFailure): string {
  return failure.kind === "not_configured"
    ? SUPABASE_NOT_CONFIGURED_MESSAGE
    : SUPABASE_NETWORK_MESSAGE;
}

type EdgeFunctionOptions = {
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
};

/** Call a Supabase Edge Function using the public anon key. */
export async function callEdgeFunction(
  functionName: string,
  options: EdgeFunctionOptions = {},
): Promise<Response | EdgeFetchFailure> {
  const config = getSupabaseConfig();
  if (!config) {
    return { kind: "not_configured" };
  }

  const { method = "POST", body, headers = {} } = options;

  try {
    return await fetch(`${config.url}/functions/v1/${functionName}`, {
      method,
      headers: {
        Authorization: `Bearer ${config.key}`,
        apikey: config.key,
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
  } catch {
    return { kind: "network" };
  }
}

/** POST to a Supabase Edge Function using the public anon key. */
export async function postEdgeFunction(
  functionName: string,
  body: Record<string, unknown>,
  headers?: Record<string, string>,
): Promise<Response | EdgeFetchFailure> {
  return callEdgeFunction(functionName, { method: "POST", body, headers });
}
