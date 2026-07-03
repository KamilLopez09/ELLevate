import { beforeEach, describe, expect, it } from "vitest";
import { CAMPER_SESSION_KEY } from "@/lib/camp-session-keys";
import {
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

  it("removes camper session keys and the telemetry queue", () => {
    touchCampSessionClock();
    setCampSessionItem(CAMPER_SESSION_KEY, '{"camper_id":"test"}');
    window.localStorage.setItem(
      TELEMETRY_QUEUE_KEY,
      JSON.stringify([{ camper_id: "test" }]),
    );

    clearAllCamperDeviceStorage();

    expect(window.localStorage.getItem(CAMPER_SESSION_KEY)).toBeNull();
    expect(window.localStorage.getItem(TELEMETRY_QUEUE_KEY)).toBeNull();
    expect(getCampSessionItem(CAMPER_SESSION_KEY)).toBeNull();
  });
});
