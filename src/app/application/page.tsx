"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SentenceCanvas } from "@/components/sentence-canvas/SentenceCanvas";
import { GameModeSelector } from "@/components/sentence-canvas/GameModeSelector";
import { StepRail } from "@/components/ui/StepRail";
import { isLessonComplete, readCamperSession } from "@/lib/camper-session";
import type { GameMode } from "@/types/sentence-canvas";

export default function ApplicationPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [mode, setMode] = useState<GameMode | null>(null);

  useEffect(() => {
    // Locked chain guardrails: enforce intake, then the lesson, before painting.
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

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-camp-blue" />
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
            Sentence Canvas
          </p>
          <StepRail current={3} />
        </header>

        {mode === null ? (
          <GameModeSelector onSelect={setMode} />
        ) : (
          <SentenceCanvas mode={mode} />
        )}
      </div>
    </main>
  );
}
