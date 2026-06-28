"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonCanvas } from "@/components/LessonCanvas";
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
  }, [sessionPrompts.length]);

  if (!ready || !camper) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue" />
    );
  }

  if (sessionPrompts.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue px-4">
        <p className="text-center text-body text-muted">
          No Week {weekNumber} prompts found for age group {ageGroup}.
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

      <div className="relative mx-auto max-w-3xl">
        <PracticeProgressHeader
          promptIndex={progress.promptIndex}
          outcomes={progress.outcomes}
          totalSteps={sessionPrompts.length}
        />

        <LessonCanvas
          weekNumber={weekNumber}
          ageGroup={ageGroup}
          sessionPrompts={sessionPrompts}
          reviewPrompts={reviewPrompts}
          builderPrompts={builderPrompts}
          externalProgress
          onProgressChange={handleProgressChange}
        />
      </div>
    </main>
  );
}
