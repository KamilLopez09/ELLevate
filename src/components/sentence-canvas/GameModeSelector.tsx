"use client";

import { motion } from "framer-motion";
import type { GameMode } from "@/types/sentence-canvas";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

interface ModeCardProps {
  emoji: string;
  title: string;
  description: string;
  accent: "purple" | "teal";
  onClick: () => void;
}

function ModeCard({ emoji, title, description, accent, onClick }: ModeCardProps) {
  const accentRing =
    accent === "purple"
      ? "hover:border-purple-accent focus-visible:outline-purple-accent"
      : "hover:border-teal-accent focus-visible:outline-teal-accent";
  const badge =
    accent === "purple"
      ? "bg-purple-accent text-white"
      : "bg-teal-accent text-white";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex min-h-[56px] flex-col items-start gap-3 rounded-3xl border-2 border-ink/10 bg-white p-6 text-left shadow-bento transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${accentRing}`}
    >
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${badge}`}
      >
        {emoji}
      </span>
      <span className="text-2xl font-extrabold text-ink">{title}</span>
      <span className="text-base text-ink/70">{description}</span>
    </motion.button>
  );
}

export function GameModeSelector({
  onSelect,
}: {
  onSelect: (mode: GameMode) => void;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRING}
      className="rounded-3xl bg-paper p-6 shadow-bento sm:p-10"
    >
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
        Almost there
      </p>
      <h2 className="mt-2 text-3xl font-extrabold text-ink">
        Choose Your Painting Style!
      </h2>
      <p className="mt-2 text-ink/70">
        Pick how you want to fill in the blanks today.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <ModeCard
          emoji="🖌️"
          title="Click to Paint"
          description="Tap a colorful word swatch to fill the blank."
          accent="purple"
          onClick={() => onSelect("click")}
        />
        <ModeCard
          emoji="✋"
          title="Drag & Match"
          description="Drag a word block into the blank space."
          accent="teal"
          onClick={() => onSelect("drag")}
        />
      </div>
    </motion.section>
  );
}
