import { describe, expect, it } from "vitest";
import {
  issueCreateToken,
  verifyCreateToken,
} from "../../supabase/functions/_shared/resume-attestation";
import { validateSnapshot } from "../../supabase/functions/_shared/resume-snapshot";

const baseSnapshot = {
  camper: {
    camper_id: "ada-l",
    first_name: "Ada",
    last_initial: "L",
    age_bracket: "10-14",
    native_language: "English",
    group_letter: "A",
    cumulativeScore: 100,
    completedModes: ["flashcard_drill"],
  },
  currentWeek: 2,
  weekPassed: {
    "1": true,
  },
};

describe("resume security validation", () => {
  it("requires sessionStartedAt when validating snapshots for resume-code creation", () => {
    const restoreValidation = validateSnapshot(baseSnapshot);
    expect(restoreValidation.ok).toBe(true);

    const createValidation = validateSnapshot(baseSnapshot, {
      requireSessionStartedAt: true,
    });
    expect(createValidation).toEqual({
      ok: false,
      error: "Invalid snapshot",
    });
  });

  it("accepts create snapshots when sessionStartedAt is present", () => {
    const result = validateSnapshot(
      {
        ...baseSnapshot,
        sessionStartedAt: 1_725_000_000_000,
      },
      { requireSessionStartedAt: true },
    );

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.snapshot.sessionStartedAt).toBe(1_725_000_000_000);
    }
  });

  it("rejects create tokens bound to a different session timestamp", async () => {
    const token = await issueCreateToken("test-secret", "ada-l", 1000, 60_000);

    await expect(verifyCreateToken("test-secret", token, "ada-l", 1000)).resolves.toBe(
      true,
    );
    await expect(verifyCreateToken("test-secret", token, "ada-l", 2000)).resolves.toBe(
      false,
    );
  });
});
