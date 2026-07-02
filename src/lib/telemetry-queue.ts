import type { CamperTelemetryRow } from "@/types/sentence-canvas";
import { postCamperTelemetryDirect } from "@/lib/telemetry-send";

const QUEUE_KEY = "elle_telemetry_queue_v1";
const MAX_QUEUE_SIZE = 24;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readQueue(): CamperTelemetryRow[] {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(QUEUE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as CamperTelemetryRow[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(items: CamperTelemetryRow[]): void {
  if (!isBrowser()) {
    return;
  }

  if (items.length === 0) {
    window.localStorage.removeItem(QUEUE_KEY);
    return;
  }

  window.localStorage.setItem(QUEUE_KEY, JSON.stringify(items));
}

/** Stores a failed telemetry payload for later retry when back online. */
export function enqueueTelemetry(payload: CamperTelemetryRow): void {
  const queue = readQueue();
  queue.push(payload);

  while (queue.length > MAX_QUEUE_SIZE) {
    queue.shift();
  }

  writeQueue(queue);
}

export function getQueuedTelemetryCount(): number {
  return readQueue().length;
}

/** Sends queued telemetry payloads; removes entries that succeed. */
export async function flushTelemetryQueue(): Promise<number> {
  const queue = readQueue();
  if (queue.length === 0) {
    return 0;
  }

  const remaining: CamperTelemetryRow[] = [];
  let flushed = 0;

  for (const payload of queue) {
    const saved = await postCamperTelemetryDirect(payload);
    if (saved) {
      flushed += 1;
    } else {
      remaining.push(payload);
    }
  }

  writeQueue(remaining);
  return flushed;
}
