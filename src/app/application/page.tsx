"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LessonCanvas } from "@/components/LessonCanvas";
import { StepRail } from "@/components/ui/StepRail";
import { curriculum } from "@/data/curriculum";
import { isLessonComplete, readCamperSession } from "@/lib/camper-session";
import { resolveAgeGroup } from "@/lib/curriculum-engine";

/** Vertical slice demo: Week 2, Ages 8–10 cohort (stored as 5-9). */
const DEMO_WEEK = 2;
const DEMO_AGE_BRACKET = "8-10";

export default function ApplicationPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

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

      <div className="relative mx-auto max-w-3xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold uppercase tracking-widest text-purple-accent">
            Week {DEMO_WEEK} · Practice
          </p>
          <StepRail current={3} />
        </header>

        <LessonCanvas
          weekNumber={DEMO_WEEK}
          ageGroup={ageGroup}
          sessionPrompts={sessionPrompts}
          reviewPrompts={reviewPrompts}
          builderPrompts={builderPrompts}
        />
      </div>
    </main>
  );
}
