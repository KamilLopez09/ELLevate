import { beforeEach, describe, expect, it } from "vitest";
import {
  createCamperId,
  getLessonCompleteWeek,
  isLessonCompleteForWeek,
  parseCamperSessionData,
  setLessonComplete,
  clearLessonComplete,
  slugify,
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

describe("camper id generation", () => {
  it("adds a non-PII suffix so same-name campers do not collide", () => {
    const first = createCamperId("Maria", "G");
    const second = createCamperId("Maria", "G");

    expect(first).toMatch(/^maria-g-[a-z0-9]{8}$/);
    expect(second).toMatch(/^maria-g-[a-z0-9]{8}$/);
    expect(first).not.toBe(second);
  });

  it("still accepts legacy slug-only camper ids", () => {
    const legacyId = slugify("Maria", "G");
    expect(
      parseCamperSessionData({
        camper_id: legacyId,
        first_name: "Maria",
        last_initial: "G",
        age_bracket: "5-9",
        native_language: "English",
        group_letter: "A",
      }),
    ).toMatchObject({ camper_id: legacyId });
  });
});
