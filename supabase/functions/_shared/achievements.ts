const ACHIEVEMENT_IDS = [
  "first_pass",
  "perfect_week",
  "speed_star",
  "halfway_hero",
  "camp_graduate",
  "mode_explorer",
  "points_500",
  "points_1000",
] as const;

type AchievementId = (typeof ACHIEVEMENT_IDS)[number];

const ACHIEVEMENT_SET = new Set<string>(ACHIEVEMENT_IDS);
const PASS_SESSION_BADGES = new Set<AchievementId>([
  "first_pass",
  "perfect_week",
  "speed_star",
]);

function isAchievementId(value: unknown): value is AchievementId {
  return typeof value === "string" && ACHIEVEMENT_SET.has(value);
}

export function countWeeksPassed(weekPassed: Record<string, boolean>): number {
  let count = 0;
  for (const value of Object.values(weekPassed)) {
    if (value === true) {
      count += 1;
    }
  }
  return count;
}

/** Server-side only — never trust client-supplied achievement lists. */
export function recomputeUnlockedAchievements(input: {
  weekPassed: Record<string, boolean>;
  cumulativeScore: number;
  completedModes: string[];
}): string[] {
  const weeksPassed = countWeeksPassed(input.weekPassed);
  const unlocked: string[] = [];

  const grant = (id: string) => {
    if (!unlocked.includes(id)) {
      unlocked.push(id);
    }
  };

  if (weeksPassed >= 1) {
    grant("first_pass");
  }
  if (weeksPassed >= 4) {
    grant("halfway_hero");
  }
  if (weeksPassed >= 8) {
    grant("camp_graduate");
  }
  if (input.completedModes.length >= 3) {
    grant("mode_explorer");
  }
  if (input.cumulativeScore >= 500) {
    grant("points_500");
  }
  if (input.cumulativeScore >= 1000) {
    grant("points_1000");
  }

  return unlocked.filter((id) => ACHIEVEMENT_SET.has(id));
}

export function normalizeSnapshotAchievements(
  input: {
    weekPassed: Record<string, boolean>;
    cumulativeScore: number;
    completedModes: string[];
  },
  suppliedAchievements: unknown,
): AchievementId[] {
  const progressBased = recomputeUnlockedAchievements(input);
  const passSessionBadges = Array.isArray(suppliedAchievements)
    ? suppliedAchievements.filter(
        (id): id is AchievementId =>
          isAchievementId(id) && PASS_SESSION_BADGES.has(id),
      )
    : [];

  return [...new Set([...progressBased, ...passSessionBadges])];
}
