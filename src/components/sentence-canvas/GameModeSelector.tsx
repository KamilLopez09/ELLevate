"use client";

import { motion } from "framer-motion";
import {
  GAME_MODE_LABELS,
  getMaxPromptScore,
  type GameModeId,
} from "@/lib/gamification";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

const MODE_ORDER: GameModeId[] = [
  "flashcard_drill",
  "match_blitz",
  "sentence_builder",
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
}: {
  onSelect: (modeId: GameModeId) => void;
}) {
  return (
    <section className="rounded-3xl bg-paper p-6 shadow-bento sm:p-10">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
        Choose Your Style
      </p>
      <h2 className="mt-2 text-3xl font-extrabold text-ink">
        Pick a game mode
      </h2>
      <p className="mt-3 text-lg text-ink/70">
        All 10 prompts use the mode you choose. Each mode has its own point
        values.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {MODE_ORDER.map((modeId, index) => {
          const meta = GAME_MODE_LABELS[modeId];
          const maxPoints = getMaxPromptScore(modeId);

          return (
            <motion.button
              key={modeId}
              type="button"
              onClick={() => onSelect(modeId)}
              aria-label={`Select ${meta.title} game mode`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING, delay: index * 0.05 }}
              className={`flex min-h-[56px] flex-col items-start gap-2 rounded-3xl border-2 p-6 text-left shadow-bento transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent ${ACCENT_CLASSES[meta.accent] ?? ACCENT_CLASSES["purple-accent"]}`}
            >
              <span className="text-xl font-extrabold text-ink">
                {meta.title}
              </span>
              <span className="text-sm text-ink/70">{meta.description}</span>
              <span className="mt-1 text-xs font-bold uppercase tracking-widest text-ink/50">
                Up to {maxPoints} pts / prompt
              </span>
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
