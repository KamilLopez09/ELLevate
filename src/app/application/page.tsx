"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LessonCanvas } from "@/components/LessonCanvas";
import { BentoCard, BentoGrid } from "@/components/ui/BentoGrid";
import { CampLoading } from "@/components/ui/CampLoading";
import { CampScreenLayout } from "@/components/ui/CampScreenLayout";
import { PracticeProgressHeader } from "@/components/ui/PracticeProgressHeader";
import { curriculum } from "@/data/curriculum";
import { isLessonComplete, readCamperSession } from "@/lib/camper-session";
import { getCurrentWeek, resolveAgeGroup } from "@/lib/curriculum-engine";
import {
  createInitialProgress,
  type LessonProgressState,
} from "@/types/lesson-progress";

const DEFAULT_AGE_BRACKET = "8-10";

export default function ApplicationPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [progress, setProgress] = useState<LessonProgressState>(
    createInitialProgress(),
  );
  const [sessionEnded, setSessionEnded] = useState(false);

  const camper = useMemo(() => (ready ? readCamperSession() : null), [ready]);

  const ageGroup = resolveAgeGroup(camper?.age_bracket ?? DEFAULT_AGE_BRACKET);

  const { reviewPrompts, builderPrompts, sessionPrompts } = useMemo(() => {
    const prompts = curriculum[weekNumber]?.brackets[ageGroup]?.prompts ?? [];
    const review = prompts.filter((prompt) => prompt.category === "review");
    const builder = prompts.filter((prompt) => prompt.category !== "review");
    return {
      reviewPrompts: review,
      builderPrompts: builder,
      sessionPrompts: [...review, ...builder],
    };
  }, [ageGroup, weekNumber]);

  const handleProgressChange = useCallback((state: LessonProgressState) => {
    setProgress(state);
  }, []);

  const handleSessionStateChange = useCallback(
    (state: { sessionComplete: boolean; showRetryModal: boolean }) => {
      setSessionEnded(state.sessionComplete || state.showRetryModal);
    },
    [],
  );

  useEffect(() => {
    if (!readCamperSession()) {
      router.replace("/");
      return;
    }
    if (!isLessonComplete()) {
      router.replace("/lesson");
      return;
    }

    setWeekNumber(getCurrentWeek());
    setReady(true);
  }, [router]);

  useEffect(() => {
    setProgress(createInitialProgress(sessionPrompts.length || 10));
    setSessionEnded(false);
  }, [sessionPrompts.length]);

  const completedCount = progress.outcomes.filter((o) => o !== "pending").length;
  const weekTheme = curriculum[weekNumber]?.theme ?? "Camp Week";

  if (!ready || !camper) {
    return (
      <CampScreenLayout screen="application" activeItemId="paint">
        <main className="flex min-h-screen items-center justify-center bg-camp-blue">
          <CampLoading label="Setting up your canvas…" />
        </main>
      </CampScreenLayout>
    );
  }

  if (sessionPrompts.length === 0) {
    return (
      <CampScreenLayout screen="application" activeItemId="paint">
        <main className="flex min-h-screen items-center justify-center bg-camp-blue px-4">
          <p className="text-center text-body text-muted-foreground">
            No Week {weekNumber} prompts found for age group {ageGroup}.
          </p>
        </main>
      </CampScreenLayout>
    );
  }

  return (
    <CampScreenLayout
      screen="application"
      activeItemId={sessionEnded ? "stats" : "paint"}
    >
      <main
        id="main-content"
        tabIndex={-1}
        className="relative min-h-screen overflow-hidden bg-camp-blue px-4 py-8 sm:px-8 focus:outline-none"
      >
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
          <h1 className="sr-only">
            Paint Mode — Week {weekNumber}: {weekTheme}
          </h1>
          <BentoGrid className="sm:auto-rows-[minmax(4rem,auto)]">
            {!sessionEnded ? (
              <>
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
                    Week {weekNumber}
                  </p>
                  <p className="mt-1 font-display font-extrabold text-bento-title text-ink">
                    {weekTheme}
                  </p>
                  <p className="mt-2 text-bento-label text-muted-foreground">
                    {completedCount} / {sessionPrompts.length} painted
                  </p>
                </BentoCard>

                <BentoCard
                  index={2}
                  span="sm:col-span-2"
                  accent="teal"
                  tilt={-1.2}
                  className="hidden min-h-[64px] flex-col justify-center !p-5 sm:flex"
                >
                  <p className="font-display font-bold text-bento-title text-ink">
                    Paint Mode
                  </p>
                  <p className="mt-1 text-bento-label text-muted-foreground">
                    Tap answers to build sentences
                  </p>
                </BentoCard>
              </>
            ) : null}

            <BentoCard
              key="lesson-canvas"
              index={sessionEnded ? 0 : 3}
              span={sessionEnded ? "sm:col-span-6" : "sm:col-span-6 lg:col-span-4"}
              accent="warm"
              tilt={sessionEnded ? 0 : 0.5}
              className={
                sessionEnded
                  ? "overflow-visible !p-4 sm:!p-6"
                  : "overflow-visible !p-0 sm:min-h-[28rem]"
              }
            >
              <LessonCanvas
                weekNumber={weekNumber}
                ageGroup={ageGroup}
                sessionPrompts={sessionPrompts}
                reviewPrompts={reviewPrompts}
                builderPrompts={builderPrompts}
                externalProgress
                onProgressChange={handleProgressChange}
                onSessionStateChange={handleSessionStateChange}
              />
            </BentoCard>
          </BentoGrid>
        </motion.div>
      </main>
    </CampScreenLayout>
  );
}
