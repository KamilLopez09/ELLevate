import type { CamperSessionData } from "@/types/sentence-canvas";

export const CAMPER_SESSION_KEY = "camperSessionData";
export const LESSON_COMPLETE_KEY = "lesson_complete";
export const LESSON_1_PASSED_KEY = "lesson_1_passed";

/**
 * Converts a display name into a URL/DB-safe id.
 * "María G." -> "maria-g"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readCamperSession(): CamperSessionData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(CAMPER_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CamperSessionData>;
    if (
      !parsed.camper_id ||
      !parsed.display_name ||
      !parsed.age_bracket ||
      !parsed.native_language ||
      !parsed.group_letter
    ) {
      return null;
    }
    return parsed as CamperSessionData;
  } catch {
    return null;
  }
}

export function writeCamperSession(data: CamperSessionData): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(CAMPER_SESSION_KEY, JSON.stringify(data));
}

/** Marks the lesson step as watched so the application step unlocks. */
export function setLessonComplete(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(LESSON_COMPLETE_KEY, "true");
}

export function isLessonComplete(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.sessionStorage.getItem(LESSON_COMPLETE_KEY) === "true";
}

/** Records that the camper cleared Lesson 1's 80% accuracy gate. */
export function setLesson1Passed(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(LESSON_1_PASSED_KEY, "true");
}

export function isLesson1Passed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.sessionStorage.getItem(LESSON_1_PASSED_KEY) === "true";
}
