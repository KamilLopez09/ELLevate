import { getSupabaseConfig } from "@/lib/supabase/client";
import type { CamperTelemetryRow } from "@/types/sentence-canvas";

/** Low-level POST to camper-telemetry (no queue side effects). */
export async function postCamperTelemetryDirect(
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
