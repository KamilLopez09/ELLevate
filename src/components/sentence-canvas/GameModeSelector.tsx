"use client";

import { motion } from "framer-motion";
import { AUTO_GAME_MODE } from "@/lib/game-mode-routing";
import {
  GAME_MODE_LABELS,
  getMaxPromptScore,
  type GameModeId,
} from "@/lib/gamification";
import { useCopy } from "@/lib/i18n/useCopy";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

const SELECTABLE_MODES: GameModeId[] = [
  "flashcard_drill",
  "sentence_builder",
  "match_blitz",
  "rapid_fire",
];

const ACCENT_CLASSES: Record<string, string> = {
  "teal-accent": "border-teal-accent bg-teal-accent/10 hover:bg-teal-accent/20",
  "purple-accent":
    "border-purple-accent bg-purple-accent/10 hover:bg-purple-accent/20",
  "gold-accent": "border-gold-accent bg-gold-accent/10 hover:bg-gold-accent/20",
};

export function GameModeSelector({
  onSelect,
  onUseAuto,
}: {
  onSelect: (modeId: GameModeId) => void;
  onUseAuto?: () => void;
}) {
  const copy = useCopy();

  return (
    <section className="rounded-3xl bg-paper p-6 shadow-bento sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
        {copy.gameModes.chooseStyle}
      </p>
      <h2 className="mt-2 text-3xl font-extrabold text-ink">
        {copy.gameModes.pickMode}
      </h2>
      <p className="mt-3 text-lg text-ink/70">{copy.gameModes.autoDescription}</p>

      {onUseAuto ? (
        <motion.button
          type="button"
          onClick={onUseAuto}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6 flex min-h-[56px] w-full flex-col items-start gap-1 rounded-3xl border-2 border-teal-accent bg-teal-accent/10 p-5 text-left shadow-bento transition hover:bg-teal-accent/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          <span className="text-lg font-extrabold text-ink">
            {copy.gameModes.autoTitle}
          </span>
          <span className="text-sm text-ink/70">{copy.gameModes.autoDescription}</span>
        </motion.button>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {SELECTABLE_MODES.map((modeId, index) => {
          const meta = GAME_MODE_LABELS[modeId];
          const localizedTitle = copy.scoreboard.gameModes[modeId];
          const maxPoints = getMaxPromptScore(modeId);

          return (
            <motion.button
              key={modeId}
              type="button"
              onClick={() => onSelect(modeId)}
              aria-label={`Select ${localizedTitle} game mode`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: index * 0.05 }}
              className={`flex min-h-[56px] min-w-[56px] flex-col items-start gap-2 rounded-3xl border-2 p-6 text-left shadow-bento transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent ${ACCENT_CLASSES[meta.accent] ?? ACCENT_CLASSES["purple-accent"]}`}
            >
              <span className="text-xl font-extrabold text-ink">
                {localizedTitle}
              </span>
              <span className="text-sm text-ink/70">{meta.description}</span>
              <span className="mt-1 text-xs font-bold uppercase tracking-widest text-ink/50">
                {copy.gameModes.pointsPerPrompt(maxPoints)}
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}

export function labelForSelectedMode(
  selectedMode: string | null,
  copy: ReturnType<typeof useCopy>,
): string {
  if (!selectedMode || selectedMode === AUTO_GAME_MODE) {
    return copy.gameModes.autoTitle;
  }
  const modeId = selectedMode as GameModeId;
  if (modeId in copy.scoreboard.gameModes) {
    return copy.scoreboard.gameModes[modeId as keyof typeof copy.scoreboard.gameModes];
  }
  return copy.gameModes.autoTitle;
}
