"use client";

import {
  ACHIEVEMENT_CATALOG,
  ACHIEVEMENT_IDS,
  type AchievementId,
} from "@/lib/achievements";
import { useCopy } from "@/lib/i18n/useCopy";

export function AchievementsStrip({
  unlocked,
}: {
  unlocked: AchievementId[];
}) {
  const copy = useCopy();
  const unlockedSet = new Set(unlocked);

  return (
    <section aria-labelledby="achievements-heading">
      <h2
        id="achievements-heading"
        className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground"
      >
        {copy.achievements.title}
      </h2>
      <p className="mt-2 text-sm text-ink/70">{copy.achievements.subtitle}</p>
      <ul className="mt-4 flex flex-wrap gap-3">
        {ACHIEVEMENT_IDS.map((id) => {
          const earned = unlockedSet.has(id);
          const meta = ACHIEVEMENT_CATALOG[id];
          return (
            <li key={id}>
              <div
                className={[
                  "flex min-h-[56px] min-w-[7.5rem] flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 text-center transition",
                  earned
                    ? "border-purple-accent/30 bg-purple-accent/10 shadow-bento"
                    : "border-border/60 bg-paper/50 opacity-55 grayscale",
                ].join(" ")}
                title={copy.achievements.labels[id]}
                aria-label={
                  earned
                    ? copy.achievements.earnedAria(copy.achievements.labels[id])
                    : copy.achievements.lockedAria(copy.achievements.labels[id])
                }
              >
                <span className="text-2xl" aria-hidden>
                  {meta.emoji}
                </span>
                <span className="text-bento-label font-bold leading-tight text-ink">
                  {copy.achievements.labels[id]}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
