/** Fired after camper telemetry is saved so menu standings can refresh. */
export const PROGRESS_SYNCED_EVENT = "elle-vate:progress-synced";

export function notifyProgressSynced(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new Event(PROGRESS_SYNCED_EVENT));
}
