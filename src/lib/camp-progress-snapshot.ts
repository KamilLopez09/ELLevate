import type { CamperSessionData } from "@/types/sentence-canvas";
import {
  getLessonCompleteWeek,
  parseCamperSessionData,
  readCamperSession,
  writeCamperSession,
} from "@/lib/camper-session";
import {
  CURRENT_WEEK_KEY,
  LESSON_COMPLETE_KEY,
  SELECTED_GAME_MODE_KEY,
  weekPassedKey,
} from "@/lib/camp-session-keys";
import {
  getCampSessionItem,
  setCampSessionItem,
  touchCampSessionClock,
} from "@/lib/session-store";

const SESSION_STARTED_AT_KEY = "elle_session_started_at";
const MAX_CUMULATIVE_SCORE = 1300;

export interface CampProgressSnapshot {
  camper: CamperSessionData;
  currentWeek?: number;
  weekPassed: Record<string, boolean>;
  /** Week whose lesson video was completed (gates application for that week). */
  lessonCompleteWeek?: number;
  /** @deprecated Legacy boolean — ignored on restore. */
  lessonComplete?: boolean;
  selectedGameMode?: string | null;
  sessionStartedAt?: number;
}

function readSessionStartedAt(): number | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  const raw = window.localStorage.getItem(SESSION_STARTED_AT_KEY);
  if (!raw) {
    return undefined;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/** Serializes current browser progress for cloud resume codes. */
export function captureCampProgressSnapshot(): CampProgressSnapshot | null {
  const camper = readCamperSession();
  if (!camper) {
    return null;
  }

  const weekPassed: Record<string, boolean> = {};
  for (let week = 1; week <= 8; week += 1) {
    weekPassed[String(week)] = getCampSessionItem(weekPassedKey(week)) === "true";
  }

  const currentWeekRaw = getCampSessionItem(CURRENT_WEEK_KEY);
  const currentWeek = currentWeekRaw
    ? Number.parseInt(currentWeekRaw, 10)
    : undefined;

  const lessonCompleteWeek = getLessonCompleteWeek();

  return {
    camper,
    weekPassed,
    currentWeek:
      currentWeek !== undefined && Number.isFinite(currentWeek)
        ? currentWeek
        : undefined,
    lessonCompleteWeek: lessonCompleteWeek ?? undefined,
    selectedGameMode: getCampSessionItem(SELECTED_GAME_MODE_KEY),
    sessionStartedAt: readSessionStartedAt(),
  };
}

/** Restores progress from a resume snapshot into localStorage. */
export function applyCampProgressSnapshot(snapshot: CampProgressSnapshot): boolean {
  const camper = parseCamperSessionData(snapshot.camper);
  if (!camper) {
    return false;
  }

  if (camper.cumulativeScore > MAX_CUMULATIVE_SCORE) {
    return false;
  }

  writeCamperSession(camper);

  for (let week = 1; week <= 8; week += 1) {
    const passed = snapshot.weekPassed[String(week)] === true;
    if (passed) {
      setCampSessionItem(weekPassedKey(week), "true");
    } else if (typeof window !== "undefined") {
      window.localStorage.removeItem(weekPassedKey(week));
    }
  }

  if (snapshot.currentWeek !== undefined) {
    setCampSessionItem(CURRENT_WEEK_KEY, String(snapshot.currentWeek));
  }

  if (snapshot.lessonCompleteWeek !== undefined) {
    setCampSessionItem(LESSON_COMPLETE_KEY, String(snapshot.lessonCompleteWeek));
  } else if (typeof window !== "undefined") {
    window.localStorage.removeItem(LESSON_COMPLETE_KEY);
  }

  if (snapshot.selectedGameMode) {
    setCampSessionItem(SELECTED_GAME_MODE_KEY, snapshot.selectedGameMode);
  } else if (typeof window !== "undefined") {
    window.localStorage.removeItem(SELECTED_GAME_MODE_KEY);
  }

  // Fresh 12h device session on this tablet — never copy the source clock (would expire instantly).
  touchCampSessionClock();

  return true;
}
