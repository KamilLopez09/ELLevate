import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CamperTelemetryRow } from "@/types/sentence-canvas";
import {
  clearTelemetryQueue,
  enqueueTelemetry,
  flushTelemetryQueue,
  TELEMETRY_QUEUE_KEY,
} from "@/lib/telemetry-queue";
import { postCamperTelemetryDirect } from "@/lib/telemetry-send";

vi.mock("@/lib/progress-events", () => ({
  notifyProgressSynced: vi.fn(),
}));

vi.mock("@/lib/telemetry-send", () => ({
  postCamperTelemetryDirect: vi.fn(),
}));

const postCamperTelemetryDirectMock = vi.mocked(postCamperTelemetryDirect);

function telemetryRow(
  camperId: string,
  weekNumber: number,
): CamperTelemetryRow {
  return {
    module_name: "sentence_canvas",
    score: 10,
    error_count: 0,
    game_mode: "sentence_builder",
    base_points: 100,
    first_try_bonus: 50,
    speed_bonus: 0,
    total_points: 150,
    week_number: weekNumber,
    correct_first_try: 10,
    cumulative_score: 150 * weekNumber,
    speed_bonuses_earned: 0,
    accuracy_rate: 100,
    camper_id: camperId,
    first_name: "Test",
    last_initial: "T",
    age_bracket: "5-9",
    native_language: "English",
    group_letter: "A",
  };
}

function readStoredQueue(): CamperTelemetryRow[] {
  const raw = window.localStorage.getItem(TELEMETRY_QUEUE_KEY);
  return raw ? (JSON.parse(raw) as CamperTelemetryRow[]) : [];
}

describe("flushTelemetryQueue", () => {
  beforeEach(() => {
    window.localStorage.clear();
    postCamperTelemetryDirectMock.mockReset();
  });

  it("preserves telemetry enqueued while a flush is in flight", async () => {
    const firstPayload = telemetryRow("camper-a", 1);
    const secondPayload = telemetryRow("camper-b", 2);

    enqueueTelemetry(firstPayload);
    postCamperTelemetryDirectMock.mockImplementationOnce(async () => {
      enqueueTelemetry(secondPayload);
      return true;
    });

    await expect(flushTelemetryQueue()).resolves.toBe(1);

    expect(readStoredQueue()).toEqual([secondPayload]);
  });

  it("does not resurrect failed telemetry after the queue is cleared mid-flush", async () => {
    const payload = telemetryRow("camper-a", 1);

    enqueueTelemetry(payload);
    postCamperTelemetryDirectMock.mockImplementationOnce(async () => {
      clearTelemetryQueue();
      return false;
    });

    await expect(flushTelemetryQueue()).resolves.toBe(0);

    expect(window.localStorage.getItem(TELEMETRY_QUEUE_KEY)).toBeNull();
  });
});
