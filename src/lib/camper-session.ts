import type { CamperSessionData } from "@/types/sentence-canvas";

export const CAMPER_SESSION_KEY = "camperSessionData";
export const LESSON_COMPLETE_KEY = "lesson_complete";

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

function normalizeSession(
  parsed: Partial<CamperSessionData>,
): CamperSessionData | null {
  if (
    !parsed.camper_id ||
    !parsed.display_name ||
    !parsed.age_bracket ||
    !parsed.native_language ||
    !parsed.group_letter
  ) {
    return null;
  }

  return {
    camper_id: parsed.camper_id,
    display_name: parsed.display_name,
    age_bracket: parsed.age_bracket,
    native_language: parsed.native_language,
    group_letter: parsed.group_letter,
    cumulativeScore: parsed.cumulativeScore ?? 0,
    completedModes: parsed.completedModes ?? [],
  };
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
    return normalizeSession(parsed);
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

export function addSessionScore(points: number, modeId: string): void {
  const session = readCamperSession();
  if (!session) {
    return;
  }

  const completedModes = session.completedModes.includes(modeId)
    ? session.completedModes
    : [...session.completedModes, modeId];

  writeCamperSession({
    ...session,
    cumulativeScore: session.cumulativeScore + points,
    completedModes,
  });
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

/** Clears the lesson-stage gate so a new week must be watched before painting. */
export function clearLessonComplete(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(LESSON_COMPLETE_KEY);
}
