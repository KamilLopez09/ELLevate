import type { CamperSessionData, AgeBracket } from "@/types/sentence-canvas";
import {
  allCampSessionKeys,
  CAMPER_SESSION_KEY,
  LESSON_COMPLETE_KEY,
  SELECTED_GAME_MODE_KEY,
} from "@/lib/camp-session-keys";
import {
  clearCampSessionStorage,
  getCampSessionItem,
  removeCampSessionItem,
  setCampSessionItem,
  touchCampSessionClock,
} from "@/lib/session-store";

export {
  CAMPER_SESSION_KEY,
  LESSON_COMPLETE_KEY,
  SELECTED_GAME_MODE_KEY,
} from "@/lib/camp-session-keys";

function migrateAgeBracket(bracket: string): AgeBracket {
  if (bracket === "5-7" || bracket === "8-10" || bracket === "5-9") {
    return "5-9";
  }
  if (bracket === "11-14" || bracket === "10-14") {
    return "10-14";
  }
  return "5-9";
}

/** COPPA-safe: keep only the first letter of a last name. */
export function toLastInitial(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }
  return trimmed.charAt(0).toUpperCase();
}

/**
 * Converts a COPPA-safe name into a URL/DB-safe id.
 * "Maria" + "G" -> "maria-g"
 */
export function slugify(firstName: string, lastInitial: string): string {
  return `${firstName} ${lastInitial}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function migrateLegacyName(parsed: Partial<CamperSessionData>): {
  first_name: string;
  last_initial: string;
} | null {
  const legacyDisplay = (parsed as { display_name?: string }).display_name;
  if (legacyDisplay) {
    const [first = "", rest = ""] = legacyDisplay.trim().split(/\s+/);
    const initial = toLastInitial(rest || first.slice(-1));
    if (first && initial) {
      return { first_name: first, last_initial: initial };
    }
  }
  return null;
}

function normalizeSession(
  parsed: Partial<CamperSessionData>,
): CamperSessionData | null {
  const legacyName = migrateLegacyName(parsed);
  const first_name = parsed.first_name ?? legacyName?.first_name;
  const last_initial = parsed.last_initial
    ? toLastInitial(parsed.last_initial)
    : legacyName?.last_initial;

  if (
    !parsed.camper_id ||
    !first_name ||
    !last_initial ||
    !parsed.age_bracket ||
    !parsed.native_language ||
    !parsed.group_letter
  ) {
    return null;
  }

  return {
    camper_id: parsed.camper_id,
    first_name: first_name.trim(),
    last_initial,
    age_bracket: migrateAgeBracket(parsed.age_bracket),
    native_language: parsed.native_language,
    group_letter: parsed.group_letter,
    cumulativeScore: parsed.cumulativeScore ?? 0,
    completedModes: parsed.completedModes ?? [],
  };
}

export function readCamperSession(): CamperSessionData | null {
  try {
    const raw = getCampSessionItem(CAMPER_SESSION_KEY);
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
  touchCampSessionClock();
  setCampSessionItem(CAMPER_SESSION_KEY, JSON.stringify(data));
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

/** Wipes all camper progress on this browser (use between campers on a shared device). */
export function clearCampSession(): void {
  clearCampSessionStorage(allCampSessionKeys());
}

/** Marks the lesson step as watched so the application step unlocks. */
export function setLessonComplete(): void {
  setCampSessionItem(LESSON_COMPLETE_KEY, "true");
}

export function isLessonComplete(): boolean {
  return getCampSessionItem(LESSON_COMPLETE_KEY) === "true";
}

/** Clears the lesson-stage gate so a new week must be watched before painting. */
export function clearLessonComplete(): void {
  removeCampSessionItem(LESSON_COMPLETE_KEY);
}

export function getSelectedGameMode(): string | null {
  return getCampSessionItem(SELECTED_GAME_MODE_KEY);
}

export function setSelectedGameMode(modeId: string): void {
  setCampSessionItem(SELECTED_GAME_MODE_KEY, modeId);
}

export function clearSelectedGameMode(): void {
  removeCampSessionItem(SELECTED_GAME_MODE_KEY);
}
