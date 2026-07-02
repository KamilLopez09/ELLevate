"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { Button } from "@/components/ui/button";
import { CampLoading } from "@/components/ui/CampLoading";
import { CampScreenLayout } from "@/components/ui/CampScreenLayout";
import { ResetCamperModal } from "@/components/ui/ResetCamperModal";
import { curriculum } from "@/data/curriculum";
import {
  countWeeksPassed,
  isWeekPassed,
  isWeekUnlocked,
  setCurrentWeek,
  TOTAL_WEEKS,
  WEEK_NUMBERS,
} from "@/lib/curriculum-engine";
import {
  clearCampSession,
  clearLessonComplete,
  clearSelectedGameMode,
  readCamperSession,
} from "@/lib/camper-session";

const POLAROID_TILTS = [-1.5, 1.2, -0.8, 1.5, -1.1, 0.9, -1.3, 1];
const POLAROID_ACCENTS: Array<"purple" | "teal" | "gold" | "warm"> = [
  "purple",
  "gold",
  "teal",
  "warm",
  "purple",
  "teal",
  "gold",
  "warm",
];
const POLAROID_SPANS = [
  "sm:col-span-3",
  "sm:col-span-3",
  "sm:col-span-2",
  "sm:col-span-4",
  "sm:col-span-4",
  "sm:col-span-2",
  "sm:col-span-3",
  "sm:col-span-3",
];

export default function MenuPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [weeksPassed, setWeeksPassed] = useState(0);
  const [cumulativeScore, setCumulativeScore] = useState(0);
  const [resetModalOpen, setResetModalOpen] = useState(false);

  useEffect(() => {
    const camper = readCamperSession();
    if (!camper) {
      router.replace("/");
      return;
    }
    setFirstName(camper.first_name);
    setWeeksPassed(countWeeksPassed());
    setCumulativeScore(camper.cumulativeScore);
    setReady(true);
  }, [router]);

  const startWeek = (weekNumber: number) => {
    setCurrentWeek(weekNumber);
    clearLessonComplete();
    clearSelectedGameMode();
    router.push("/lesson");
  };

  const confirmNewCamper = () => {
    clearCampSession();
    router.replace("/");
  };

  if (!ready) {
    return (
      <CampScreenLayout screen="menu" activeItemId="weeks">
        <main className="flex min-h-screen items-center justify-center bg-camp-blue">
          <CampLoading label="Loading your camp weeks…" />
        </main>
      </CampScreenLayout>
    );
  }

  return (
    <CampScreenLayout screen="menu" activeItemId="weeks">
      <main
        id="main-content"
        tabIndex={-1}
        className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-10 sm:px-8 focus:outline-none"
      >
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="relative mx-auto max-w-5xl"
        >
          <BentoGrid className="sm:auto-rows-[minmax(7rem,auto)]">
            <BentoCard
              index={0}
              span="sm:col-span-6"
              accent="gold"
              tilt={-0.4}
              className="!p-8"
            >
              <p className="text-bento-label font-semibold uppercase tracking-widest text-accent">
                8-Week Camp Journey
              </p>
              <h1
                className="mt-2 font-display font-extrabold text-ink"
                style={{ fontSize: "var(--text-h1)" }}
              >
                Hi, {firstName}!
              </h1>
              <p
                className="mt-4 text-ink/80"
                style={{ fontSize: "var(--text-body)" }}
              >
                Pick a week to watch, paint, and unlock the next adventure.
              </p>
              <div
                className="mt-5 flex flex-wrap gap-3"
                aria-label="Your camp progress"
              >
                <span className="inline-flex min-h-[44px] items-center rounded-full bg-purple-accent/15 px-4 py-2 text-bento-label font-bold text-purple-accent">
                  {weeksPassed}/{TOTAL_WEEKS} weeks passed
                </span>
                <span className="inline-flex min-h-[44px] items-center rounded-full bg-teal-accent/15 px-4 py-2 text-bento-label font-bold tabular-nums text-teal-accent">
                  {cumulativeScore.toLocaleString()} total points
                </span>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="xl"
                  onClick={() => setResetModalOpen(true)}
                  className="min-h-[56px] border-ink/20 bg-paper/80 text-ink hover:bg-paper"
                >
                  New camper (reset this device)
                </Button>
              </div>
            </BentoCard>

            {WEEK_NUMBERS.map((weekNumber, index) => {
              const week = curriculum[weekNumber];
              const unlocked = isWeekUnlocked(weekNumber);
              const passed = isWeekPassed(weekNumber);
              const tilt = POLAROID_TILTS[index] ?? 0;
              const accent = POLAROID_ACCENTS[index] ?? "warm";
              const span = POLAROID_SPANS[index] ?? "sm:col-span-3";

              if (!unlocked) {
                return (
                  <BentoCard
                    key={weekNumber}
                    index={index + 1}
                    span={span}
                    tilt={tilt}
                    accent={accent}
                    aria-disabled
                    className="cursor-not-allowed opacity-60"
                  >
                    <WeekCardContent
                      weekNumber={weekNumber}
                      theme={week.theme}
                      unlocked={false}
                      passed={false}
                    />
                  </BentoCard>
                );
              }

              return (
                <BentoCard
                  key={weekNumber}
                  as="button"
                  index={index + 1}
                  span={span}
                  tilt={tilt}
                  accent={accent}
                  onClick={() => startWeek(weekNumber)}
                  className="min-h-[64px] cursor-pointer text-left transition hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <WeekCardContent
                    weekNumber={weekNumber}
                    theme={week.theme}
                    unlocked
                    passed={passed}
                  />
                </BentoCard>
              );
            })}

            <BentoCard
              index={WEEK_NUMBERS.length + 1}
              span="sm:col-span-6"
              accent="warm"
              tilt={0}
              className="!py-4 text-center"
            >
              <p className="text-bento-label text-muted-foreground">
                Completely free · Built for campers ages 5–14
              </p>
            </BentoCard>
          </BentoGrid>
        </motion.div>
        <ResetCamperModal
          open={resetModalOpen}
          onConfirm={confirmNewCamper}
          onCancel={() => setResetModalOpen(false)}
        />
      </main>
    </CampScreenLayout>
  );
}

function WeekCardContent({
  weekNumber,
  theme,
  unlocked,
  passed,
}: {
  weekNumber: number;
  theme: string;
  unlocked: boolean;
  passed: boolean;
}) {
  return (
    <div className="flex min-h-[64px] flex-col items-start gap-3">
      <span
        className={[
          "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-xl font-extrabold",
          unlocked ? "bg-purple-accent text-card" : "bg-ink/20 text-card",
        ].join(" ")}
      >
        {weekNumber}
      </span>
      <span
        className={[
          "font-display font-extrabold text-bento-title",
          unlocked ? "text-ink" : "text-ink/60",
        ].join(" ")}
      >
        {theme}
      </span>
      <span className="text-bento-label text-ink/70">
        Week {weekNumber} of {TOTAL_WEEKS}
      </span>
      {unlocked ? (
        passed ? (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-success-accent/15 px-4 py-2 text-bento-label font-bold text-success-accent">
            Passed · Replay
          </span>
        ) : (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-purple-accent/15 px-4 py-2 text-bento-label font-bold text-purple-accent">
            Start →
          </span>
        )
      ) : (
        <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-ink/10 px-4 py-2 text-bento-label font-bold text-ink/50">
          Finish Week {weekNumber - 1} to unlock
        </span>
      )}
    </div>
  );
}
