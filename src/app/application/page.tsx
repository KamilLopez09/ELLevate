"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LessonCanvas } from "@/components/LessonCanvas";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { PracticeProgressHeader } from "@/components/ui/PracticeProgressHeader";
import { curriculum } from "@/data/curriculum";
import { isLessonComplete, readCamperSession } from "@/lib/camper-session";
import { resolveAgeGroup } from "@/lib/curriculum-engine";
import {
  createInitialProgress,
  type LessonProgressState,
} from "@/types/lesson-progress";

/** Vertical slice demo: Week 2, Ages 8–10 cohort (stored as 5-9). */
const DEMO_WEEK = 2;
const DEMO_AGE_BRACKET = "8-10";

export default function ApplicationPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [progress, setProgress] = useState<LessonProgressState>(
    createInitialProgress(),
  );

  const camper = useMemo(() => (ready ? readCamperSession() : null), [ready]);

  const ageGroup = resolveAgeGroup(camper?.age_bracket ?? DEMO_AGE_BRACKET);

  const { reviewPrompts, builderPrompts, sessionPrompts } = useMemo(() => {
    const prompts = curriculum[DEMO_WEEK]?.brackets[ageGroup]?.prompts ?? [];
    const review = prompts.filter((prompt) => prompt.category === "review");
    const builder = prompts.filter((prompt) => prompt.category !== "review");
    return {
      reviewPrompts: review,
      builderPrompts: builder,
      sessionPrompts: [...review, ...builder],
    };
  }, [ageGroup]);

  const handleProgressChange = useCallback((state: LessonProgressState) => {
    setProgress(state);
  }, []);

  useEffect(() => {
    if (!readCamperSession()) {
      router.replace("/");
      return;
    }
    if (!isLessonComplete()) {
      router.replace("/lesson");
      return;
    }

    setReady(true);
  }, [router]);

  useEffect(() => {
    setProgress(createInitialProgress(sessionPrompts.length || 10));
  }, [sessionPrompts.length]);

  const completedCount = progress.outcomes.filter((o) => o !== "pending").length;
  const weekTheme = curriculum[DEMO_WEEK]?.theme ?? "Camp Week";

  if (!ready || !camper) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue" />
    );
  }

  if (sessionPrompts.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue px-4">
        <p className="text-center text-body text-muted">
          No Week {DEMO_WEEK} prompts found for age group {ageGroup}.
        </p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-8 sm:px-8">
      <div
        aria-hidden
        className="canvas-blob canvas-blob-teal -right-16 top-0 h-52 w-52"
      />
      <div
        aria-hidden
        className="canvas-blob canvas-blob-gold -left-10 bottom-20 h-60 w-60"
      />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
        className="relative mx-auto max-w-5xl"
      >
        <BentoGrid className="sm:auto-rows-[minmax(4rem,auto)]">
          <BentoCard
            index={0}
            span="sm:col-span-4"
            accent="purple"
            tilt={-0.6}
            className="!p-4 sm:!p-5"
          >
            <PracticeProgressHeader
              promptIndex={progress.promptIndex}
              outcomes={progress.outcomes}
              totalSteps={sessionPrompts.length}
            />
          </BentoCard>

          <BentoCard
            index={1}
            span="sm:col-span-2"
            accent="gold"
            tilt={1}
            className="flex min-h-[64px] flex-col justify-center !p-5"
          >
            <p className="text-bento-label font-semibold uppercase tracking-widest text-accent">
              Week {DEMO_WEEK}
            </p>
            <p className="mt-1 font-display font-extrabold text-bento-title text-ink">
              {weekTheme}
            </p>
            <p className="mt-2 text-bento-label text-muted">
              {completedCount} / {sessionPrompts.length} painted
            </p>
          </BentoCard>

          <BentoCard
            index={2}
            span="sm:col-span-2 sm:row-span-1"
            accent="teal"
            tilt={-1.2}
            className="hidden min-h-[64px] flex-col justify-center !p-5 sm:flex"
          >
            <span className="text-3xl" aria-hidden>
              🎨
            </span>
            <p className="mt-2 font-display font-bold text-bento-title text-ink">
              Paint Mode
            </p>
            <p className="mt-1 text-bento-label text-muted">
              Tap answers to build sentences
            </p>
          </BentoCard>

          <BentoCard
            index={3}
            span="sm:col-span-4"
            accent="warm"
            tilt={0.5}
            className="!p-0 sm:min-h-[28rem]"
          >
            <LessonCanvas
              weekNumber={DEMO_WEEK}
              ageGroup={ageGroup}
              sessionPrompts={sessionPrompts}
              reviewPrompts={reviewPrompts}
              builderPrompts={builderPrompts}
              externalProgress
              onProgressChange={handleProgressChange}
            />
          </BentoCard>
        </BentoGrid>
      </motion.div>
    </main>
  );
}
