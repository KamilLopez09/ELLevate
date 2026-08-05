import { beforeEach, describe, expect, it } from "vitest";
import {
  CAMPER_SESSION_KEY,
  LESSON_COMPLETE_KEY,
} from "@/lib/camp-session-keys";
import {
  clearAllCamperDeviceStorage,
  getCampSessionItem,
  SESSION_TTL_MS,
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

  it("expires legacy camper progress when the session clock is missing", () => {
    window.localStorage.setItem(CAMPER_SESSION_KEY, '{"camper_id":"legacy"}');

    expect(getCampSessionItem(CAMPER_SESSION_KEY)).toBeNull();
    expect(window.localStorage.getItem(CAMPER_SESSION_KEY)).toBeNull();
  });

  it("drops incidental writes after the session ttl has expired", () => {
    touchCampSessionClock();
    setCampSessionItem(CAMPER_SESSION_KEY, '{"camper_id":"expired"}');
    window.localStorage.setItem(
      "elle_session_started_at",
      String(Date.now() - SESSION_TTL_MS - 1),
    );

    setCampSessionItem(LESSON_COMPLETE_KEY, "1");

    expect(window.localStorage.getItem(CAMPER_SESSION_KEY)).toBeNull();
    expect(window.localStorage.getItem(LESSON_COMPLETE_KEY)).toBeNull();
  });

  it("allows an explicit new camper session to replace expired storage", () => {
    touchCampSessionClock();
    setCampSessionItem(CAMPER_SESSION_KEY, '{"camper_id":"expired"}');
    window.localStorage.setItem(
      "elle_session_started_at",
      String(Date.now() - SESSION_TTL_MS - 1),
    );

    setCampSessionItem(CAMPER_SESSION_KEY, '{"camper_id":"fresh"}');

    expect(window.localStorage.getItem(CAMPER_SESSION_KEY)).toBe(
      '{"camper_id":"fresh"}',
    );
    expect(window.localStorage.getItem("elle_session_started_at")).not.toBeNull();
  });
});
