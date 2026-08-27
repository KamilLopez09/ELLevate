import { beforeEach, describe, expect, it } from "vitest";
import {
  CAMPER_SESSION_KEY,
  parseCamperSessionData,
  getLessonCompleteWeek,
  isLessonCompleteForWeek,
  readCamperSession,
  setLessonComplete,
  clearLessonComplete,
  toLastInitial,
} from "@/lib/camper-session";
import { touchCampSessionClock } from "@/lib/session-store";

describe("lesson complete per week", () => {
  beforeEach(() => {
    window.localStorage.clear();
    touchCampSessionClock();
  });

  it("tracks completion for a specific week only", () => {
    setLessonComplete(2);
    expect(getLessonCompleteWeek()).toBe(2);
    expect(isLessonCompleteForWeek(2)).toBe(true);
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });

  it("clears the gate when starting a new week", () => {
    setLessonComplete(1);
    clearLessonComplete();
    expect(isLessonCompleteForWeek(1)).toBe(false);
  });
});

describe("last initial normalization", () => {
  beforeEach(() => {
    window.localStorage.clear();
    touchCampSessionClock();
  });

  it("normalizes accented initials to the ASCII value accepted by telemetry", () => {
    expect(toLastInitial("Álvarez")).toBe("A");
    expect(toLastInitial("ñ")).toBe("N");
  });

  it("normalizes restored or existing sessions before telemetry reads them", () => {
    window.localStorage.setItem(
      CAMPER_SESSION_KEY,
      JSON.stringify({
        camper_id: "maria-a",
        first_name: "María",
        last_initial: "Á",
        age_bracket: "5-9",
        native_language: "Spanish",
        group_letter: "B",
        cumulativeScore: 120,
        completedModes: [],
      }),
    );

    expect(readCamperSession()?.last_initial).toBe("A");
    expect(
      parseCamperSessionData({
        camper_id: "maria-a",
        first_name: "María",
        last_initial: "Á",
        age_bracket: "5-9",
        native_language: "Spanish",
        group_letter: "B",
        cumulativeScore: 120,
        completedModes: [],
      })?.last_initial,
    ).toBe("A");
  });
});
