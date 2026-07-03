import { countWeeksPassed } from "@/lib/curriculum-engine";
import { readCamperSession, writeCamperSession } from "@/lib/camper-session";
import { PASS_THRESHOLD, SESSION_PROMPT_COUNT } from "@/lib/constants";

export const ACHIEVEMENT_IDS = [
  "first_pass",
  "perfect_week",
  "speed_star",
  "halfway_hero",
  "camp_graduate",
  "mode_explorer",
  "points_500",
  "points_1000",
] as const;

export type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

const ACHIEVEMENT_ID_SET = new Set<string>(ACHIEVEMENT_IDS);

export function isAchievementId(value: string): value is AchievementId {
  return ACHIEVEMENT_ID_SET.has(value);
}

export interface AchievementMeta {
  id: AchievementId;
  emoji: string;
}

export const ACHIEVEMENT_CATALOG: Record<AchievementId, AchievementMeta> = {
  first_pass: { id: "first_pass", emoji: "🎨" },
  perfect_week: { id: "perfect_week", emoji: "⭐" },
  speed_star: { id: "speed_star", emoji: "⚡" },
  halfway_hero: { id: "halfway_hero", emoji: "🏕️" },
  camp_graduate: { id: "camp_graduate", emoji: "🎓" },
  mode_explorer: { id: "mode_explorer", emoji: "🧭" },
  points_500: { id: "points_500", emoji: "💎" },
  points_1000: { id: "points_1000", emoji: "👑" },
};

export interface PassAchievementContext {
  weekNumber: number;
  correctFirstTry: number;
  totalPrompts: number;
  totalSpeedBonus: number;
}

export interface ProgressAchievementContext {
  weeksPassed: number;
  cumulativeScore: number;
  completedModes: string[];
}

function filterValidIds(ids: string[]): AchievementId[] {
  return ids.filter(isAchievementId);
}

export function evaluateAchievements(
  pass: PassAchievementContext | null,
  progress: ProgressAchievementContext,
  alreadyUnlocked: string[],
): AchievementId[] {
  const unlocked = new Set(filterValidIds(alreadyUnlocked));
  const newly: AchievementId[] = [];

  const grant = (id: AchievementId) => {
    if (!unlocked.has(id)) {
      unlocked.add(id);
      newly.push(id);
    }
  };

  if (pass && pass.correctFirstTry >= PASS_THRESHOLD) {
    grant("first_pass");
  }

  if (
    pass &&
    pass.totalPrompts >= SESSION_PROMPT_COUNT &&
    pass.correctFirstTry >= SESSION_PROMPT_COUNT
  ) {
    grant("perfect_week");
  }

  if (pass && pass.totalSpeedBonus >= 30) {
    grant("speed_star");
  }

  if (!pass && progress.weeksPassed >= 1) {
    grant("first_pass");
  }

  if (progress.weeksPassed >= 4) {
    grant("halfway_hero");
  }

  if (progress.weeksPassed >= 8) {
    grant("camp_graduate");
  }

  if (progress.completedModes.length >= 3) {
    grant("mode_explorer");
  }

  if (progress.cumulativeScore >= 500) {
    grant("points_500");
  }

  if (progress.cumulativeScore >= 1000) {
    grant("points_1000");
  }

  return newly;
}

export function readUnlockedAchievements(): AchievementId[] {
  const session = readCamperSession();
  if (!session) {
    return [];
  }
  return filterValidIds(session.unlockedAchievements ?? []);
}

/** Merges newly earned badges into the camper session. Returns ids unlocked this call. */
export function unlockAchievements(ids: AchievementId[]): AchievementId[] {
  const session = readCamperSession();
  if (!session || ids.length === 0) {
    return [];
  }

  const existing = new Set(filterValidIds(session.unlockedAchievements ?? []));
  const fresh = ids.filter((id) => !existing.has(id));
  if (fresh.length === 0) {
    return [];
  }

  writeCamperSession({
    ...session,
    unlockedAchievements: [...existing, ...fresh],
  });

  return fresh;
}

/** Re-checks progress-based badges and drops any that no longer match ground truth. */
export function reconcileAchievementsWithProgress(): AchievementId[] {
  const session = readCamperSession();
  if (!session) {
    return [];
  }

  const progress: ProgressAchievementContext = {
    weeksPassed: countWeeksPassed(),
    cumulativeScore: session.cumulativeScore,
    completedModes: session.completedModes,
  };

  const progressBased = evaluateAchievements(null, progress, []);
  const passSessionBadges = new Set<AchievementId>([
    "first_pass",
    "perfect_week",
    "speed_star",
  ]);
  const sessionOnly = (session.unlockedAchievements ?? []).filter(
    (id): id is AchievementId => isAchievementId(id) && passSessionBadges.has(id),
  );
  const merged = [...new Set([...progressBased, ...sessionOnly])];

  writeCamperSession({
    ...session,
    unlockedAchievements: merged,
  });

  return merged;
}

/** Call after a passed practice session. */
export function unlockAchievementsAfterPass(
  pass: PassAchievementContext,
): AchievementId[] {
  const session = readCamperSession();
  if (!session) {
    return [];
  }

  const progress: ProgressAchievementContext = {
    weeksPassed: countWeeksPassed(),
    cumulativeScore: session.cumulativeScore,
    completedModes: session.completedModes,
  };

  const newly = evaluateAchievements(
    pass,
    progress,
    session.unlockedAchievements ?? [],
  );
  return unlockAchievements(newly);
}
