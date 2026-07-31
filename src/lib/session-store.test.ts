import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CAMPER_SESSION_KEY } from "@/lib/camp-session-keys";
import {
  SESSION_TTL_MS,
  clearAllCamperDeviceStorage,
  getCampSessionItem,
  setCampSessionItem,
  touchCampSessionClock,
} from "@/lib/session-store";
import { TELEMETRY_QUEUE_KEY } from "@/lib/telemetry-queue";

describe("clearAllCamperDeviceStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("removes camper session keys but preserves the telemetry queue", () => {
    touchCampSessionClock();
    setCampSessionItem(CAMPER_SESSION_KEY, '{"camper_id":"test"}');
    window.localStorage.setItem(
      TELEMETRY_QUEUE_KEY,
      JSON.stringify([{ camper_id: "test" }]),
    );

    clearAllCamperDeviceStorage();

    expect(window.localStorage.getItem(CAMPER_SESSION_KEY)).toBeNull();
    expect(window.localStorage.getItem(TELEMETRY_QUEUE_KEY)).toBe(
      JSON.stringify([{ camper_id: "test" }]),
    );
    expect(getCampSessionItem(CAMPER_SESSION_KEY)).toBeNull();
  });

  it("expires camper session keys without dropping queued telemetry", () => {
    const startedAt = new Date("2026-01-01T00:00:00.000Z");
    vi.useFakeTimers();
    vi.setSystemTime(startedAt);

    touchCampSessionClock();
    setCampSessionItem(CAMPER_SESSION_KEY, '{"camper_id":"test"}');
    window.localStorage.setItem(
      TELEMETRY_QUEUE_KEY,
      JSON.stringify([{ camper_id: "test", week_number: 1 }]),
    );

    vi.setSystemTime(startedAt.getTime() + SESSION_TTL_MS + 1);

    expect(getCampSessionItem(CAMPER_SESSION_KEY)).toBeNull();
    expect(window.localStorage.getItem(TELEMETRY_QUEUE_KEY)).toBe(
      JSON.stringify([{ camper_id: "test", week_number: 1 }]),
    );
  });
});
