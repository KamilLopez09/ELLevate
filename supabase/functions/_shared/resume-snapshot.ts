const ALLOWED_GAME_MODES = new Set([
  "flashcard_drill",
  "match_blitz",
  "sentence_builder",
  "rapid_fire",
]);

export const MAX_CUMULATIVE_SCORE = 1300;
export const MAX_ACTIVE_SNAPSHOTS_PER_CAMPER = 2;

export interface SnapshotCamper {
  camper_id: string;
  first_name: string;
  last_initial: string;
  age_bracket: string;
  native_language: string;
  group_letter: string;
  cumulativeScore: number;
  completedModes: string[];
}

export interface CampProgressSnapshot {
  camper: SnapshotCamper;
  currentWeek?: number;
  weekPassed: Record<string, boolean>;
  lessonComplete?: boolean;
  selectedGameMode?: string | null;
  sessionStartedAt?: number;
}

function isString(value: unknown, min: number, max: number): value is string {
  return typeof value === "string" && value.length >= min && value.length <= max;
}

export function slugifyCamperId(firstName: string, lastInitial: string): string {
  return `${firstName} ${lastInitial}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateSnapshot(
  body: unknown,
): { ok: true; snapshot: CampProgressSnapshot } | { ok: false; error: string } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Invalid snapshot" };
  }

  const record = body as Record<string, unknown>;
  const camper = record.camper;
  if (!camper || typeof camper !== "object") {
    return { ok: false, error: "Invalid snapshot" };
  }

  const c = camper as Record<string, unknown>;
  if (
    !isString(c.camper_id, 1, 64) ||
    !isString(c.first_name, 1, 40) ||
    !isString(c.last_initial, 1, 1) ||
    !isString(c.age_bracket, 3, 5) ||
    !isString(c.native_language, 5, 10) ||
    !isString(c.group_letter, 1, 1) ||
    typeof c.cumulativeScore !== "number" ||
    !Number.isFinite(c.cumulativeScore) ||
    !Array.isArray(c.completedModes)
  ) {
    return { ok: false, error: "Invalid snapshot" };
  }

  if (c.age_bracket !== "5-9" && c.age_bracket !== "10-14") {
    return { ok: false, error: "Invalid snapshot" };
  }
  if (c.native_language !== "English" && c.native_language !== "Spanish") {
    return { ok: false, error: "Invalid snapshot" };
  }
  if (!/^[A-Z]$/.test(c.group_letter)) {
    return { ok: false, error: "Invalid snapshot" };
  }

  const firstName = c.first_name.trim();
  const lastInitial = c.last_initial.toUpperCase();
  const camperId = c.camper_id;
  if (slugifyCamperId(firstName, lastInitial) !== camperId) {
    return { ok: false, error: "Invalid snapshot" };
  }

  const cumulativeScore = Math.max(
    0,
    Math.min(MAX_CUMULATIVE_SCORE, Math.floor(c.cumulativeScore)),
  );

  const completedModes = c.completedModes.filter(
    (mode): mode is string =>
      typeof mode === "string" && ALLOWED_GAME_MODES.has(mode),
  );

  const weekPassed = record.weekPassed;
  if (!weekPassed || typeof weekPassed !== "object") {
    return { ok: false, error: "Invalid snapshot" };
  }

  const normalizedWeekPassed: Record<string, boolean> = {};
  let passedCount = 0;
  for (const [key, value] of Object.entries(
    weekPassed as Record<string, unknown>,
  )) {
    const weekNum = Number.parseInt(key, 10);
    if (!Number.isFinite(weekNum) || weekNum < 1 || weekNum > 8) {
      continue;
    }
    if (value === true) {
      normalizedWeekPassed[String(weekNum)] = true;
      passedCount += 1;
    }
  }

  if (passedCount > 8) {
    return { ok: false, error: "Invalid snapshot" };
  }

  const currentWeek = record.currentWeek;
  if (
    currentWeek !== undefined &&
    (typeof currentWeek !== "number" ||
      !Number.isInteger(currentWeek) ||
      currentWeek < 1 ||
      currentWeek > 8)
  ) {
    return { ok: false, error: "Invalid snapshot" };
  }

  const snapshot: CampProgressSnapshot = {
    camper: {
      camper_id: camperId,
      first_name: firstName,
      last_initial: lastInitial,
      age_bracket: c.age_bracket,
      native_language: c.native_language,
      group_letter: c.group_letter,
      cumulativeScore,
      completedModes,
    },
    weekPassed: normalizedWeekPassed,
  };

  if (currentWeek !== undefined) {
    snapshot.currentWeek = currentWeek;
  }
  if (typeof record.lessonComplete === "boolean") {
    snapshot.lessonComplete = record.lessonComplete;
  }
  if (record.selectedGameMode === null) {
    snapshot.selectedGameMode = null;
  } else if (
    isString(record.selectedGameMode, 1, 32) &&
    ALLOWED_GAME_MODES.has(record.selectedGameMode)
  ) {
    snapshot.selectedGameMode = record.selectedGameMode;
  }
  if (
    typeof record.sessionStartedAt === "number" &&
    Number.isFinite(record.sessionStartedAt) &&
    record.sessionStartedAt > 0
  ) {
    snapshot.sessionStartedAt = record.sessionStartedAt;
  }

  return { ok: true, snapshot };
}
