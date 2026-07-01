import { getSupabaseConfig } from "@/lib/supabase/client";
import type { CamperTelemetryRow } from "@/types/sentence-canvas";

/**
 * Send a completed-session summary to the `camper-telemetry` Edge Function.
 *
 * The static client no longer INSERTs into Supabase directly; the Edge Function
 * validates the payload and performs the write with the service role key. The
 * anon key is still sent so the function can be called through the Supabase
 * gateway. Returns `true` on success, `false` if telemetry could not be saved
 * (missing env or a non-2xx response) so the caller can show a soft warning.
 */
export async function postCamperTelemetry(
  payload: CamperTelemetryRow,
): Promise<boolean> {
  const config = getSupabaseConfig();
  if (!config) {
    return false;
  }

  try {
    const response = await fetch(
      `${config.url}/functions/v1/camper-telemetry`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.key}`,
          apikey: config.key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );
    return response.ok;
  } catch {
    return false;
  }
}
