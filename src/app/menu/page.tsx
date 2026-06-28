"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { curriculum } from "@/data/curriculum";
import {
  isWeekPassed,
  isWeekUnlocked,
  setCurrentWeek,
  TOTAL_WEEKS,
  WEEK_NUMBERS,
} from "@/lib/curriculum-engine";
import {
  clearLessonComplete,
  clearSelectedGameMode,
  readCamperSession,
} from "@/lib/camper-session";

const SPRING = { type: "spring" as const, stiffness: 260, damping: 26 };

export default function MenuPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [firstName, setFirstName] = useState("");

  useEffect(() => {
    const camper = readCamperSession();
    if (!camper) {
      router.replace("/");
      return;
    }
    setFirstName(camper.first_name);
    setReady(true);
  }, [router]);

  const startWeek = (weekNumber: number) => {
    setCurrentWeek(weekNumber);
    clearLessonComplete();
    clearSelectedGameMode();
    router.push("/lesson");
  };

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue" />
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-10 sm:px-8">
      <div
        aria-hidden
        className="canvas-blob canvas-blob-purple -left-20 top-10 h-56 w-56"
      />
      <div
        aria-hidden
        className="canvas-blob canvas-blob-gold right-0 top-32 h-48 w-48"
      />
      <div
        aria-hidden
        className="canvas-blob canvas-blob-teal bottom-10 left-1/3 h-64 w-64"
      />

      <div className="relative mx-auto flex max-w-3xl flex-col gap-8">
        <header className="ca-surface p-8 shadow-bento">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">
            8-Week Camp Journey
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink sm:text-5xl">
            Hi, {firstName}! 👋
          </h1>
          <p className="mt-4 text-lg text-ink/80">
            Pick a week to watch, paint, and unlock the next adventure.
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          {WEEK_NUMBERS.map((weekNumber, index) => {
            const week = curriculum[weekNumber];
            const unlocked = isWeekUnlocked(weekNumber);
            const passed = isWeekPassed(weekNumber);

            if (!unlocked) {
              return (
                <motion.div
                  key={weekNumber}
                  aria-disabled
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ ...SPRING, delay: index * 0.03 }}
                  className="flex min-h-[56px] cursor-not-allowed flex-col items-start gap-3 ca-surface p-6 text-left opacity-60 shadow-bento"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink/20 text-xl font-extrabold text-white">
                    {weekNumber}
                  </span>
                  <span className="text-xl font-extrabold text-ink/60">
                    {week.theme}
                  </span>
                  <span className="text-sm text-ink/50">
                    Week {weekNumber} of {TOTAL_WEEKS}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-ink/10 px-3 py-1 text-sm font-bold text-ink/50">
                    🔒 Finish Week {weekNumber - 1} to unlock
                  </span>
                </motion.div>
              );
            }

            return (
              <motion.button
                key={weekNumber}
                type="button"
                onClick={() => startWeek(weekNumber)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING, delay: index * 0.03 }}
                className="flex min-h-[56px] flex-col items-start gap-3 ca-surface p-6 text-left shadow-bento transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-accent text-xl font-extrabold text-white">
                  {weekNumber}
                </span>
                <span className="text-xl font-extrabold text-ink">
                  {week.theme}
                </span>
                <span className="text-sm text-ink/70">
                  Week {weekNumber} of {TOTAL_WEEKS}
                </span>
                {passed ? (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-accent/15 px-3 py-1 text-sm font-bold text-success-accent">
                    Passed ✓ · Replay
                  </span>
                ) : (
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-accent/15 px-3 py-1 text-sm font-bold text-purple-accent">
                    Start →
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>

        <footer className="text-center text-sm text-muted">
          Completely free · Built for campers ages 5–14
        </footer>
      </div>
    </main>
  );
}
