import { enqueueTelemetry } from "@/lib/telemetry-queue";
import { postCamperTelemetryDirect } from "@/lib/telemetry-send";
import type { CamperTelemetryRow } from "@/types/sentence-canvas";

export { flushTelemetryQueue, getQueuedTelemetryCount } from "@/lib/telemetry-queue";

/**
 * Send a completed-session summary to the `camper-telemetry` Edge Function.
 *
 * When offline or the server rejects the payload, the row is queued locally and
 * retried on the next successful flush (see PwaProvider).
 */
export async function postCamperTelemetry(
  payload: CamperTelemetryRow,
): Promise<boolean> {
  const saved = await postCamperTelemetryDirect(payload);
  if (saved) {
    return true;
  }

  enqueueTelemetry(payload);
  return false;
}
