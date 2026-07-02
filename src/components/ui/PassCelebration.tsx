"use client";

import { motion } from "framer-motion";
import { PASS_THRESHOLD } from "@/lib/constants";
import { useCopy } from "@/lib/i18n/useCopy";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 22 };

export interface PassCelebrationProps {
  weekNumber: number;
  weekTheme: string;
  correctFirstTry: number;
  totalPrompts: number;
  onContinue: () => void;
}

export function PassCelebration({
  weekNumber,
  weekTheme,
  correctFirstTry,
  totalPrompts,
  onContinue,
}: PassCelebrationProps) {
  const copy = useCopy();

  return (
    <section
      className="relative overflow-hidden rounded-3xl bg-paper p-8 text-center shadow-bento sm:p-10"
      aria-labelledby="pass-celebration-heading"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {[0, 1, 2, 3, 4].map((index) => (
          <motion.span
            key={index}
            className="absolute h-3 w-3 rounded-full"
            style={{
              backgroundColor:
                index % 3 === 0
                  ? "var(--purple-accent)"
                  : index % 3 === 1
                    ? "var(--teal-accent)"
                    : "var(--gold-accent)",
              left: `${15 + index * 18}%`,
              top: `${20 + (index % 2) * 10}%`,
            }}
            initial={{ opacity: 0, scale: 0, y: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.6], y: [-8, -48] }}
            transition={{
              duration: 1.2,
              delay: index * 0.12,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={SPRING}
        className="relative mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gold-accent/20 ring-4 ring-gold-accent/30"
      >
        <span className="font-display text-4xl font-extrabold text-gold-accent">
          {weekNumber}
        </span>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.08 }}
        className="text-sm font-semibold uppercase tracking-widest text-teal-accent"
      >
        {copy.celebration.weekComplete}
      </motion.p>
      <motion.h2
        id="pass-celebration-heading"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.12 }}
        className="mt-2 font-display text-3xl font-extrabold text-ink sm:text-4xl"
      >
        {copy.celebration.passedWeek(weekNumber)}
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.16 }}
        className="mt-3 text-lg text-ink/80"
      >
        {copy.celebration.summary(
          weekTheme,
          correctFirstTry,
          totalPrompts,
          PASS_THRESHOLD,
        )}
      </motion.p>

      <motion.button
        type="button"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING, delay: 0.22 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onContinue}
        className="mt-8 min-h-[56px] min-w-[56px] rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
      >
        {copy.celebration.seeScore}
      </motion.button>
    </section>
  );
}
