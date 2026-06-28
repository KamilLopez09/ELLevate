"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { GameModeSelector } from "@/components/sentence-canvas/GameModeSelector";
import { LessonCanvas } from "@/components/LessonCanvas";
import { StepRail } from "@/components/ui/StepRail";
import { getCurrentWeek, toAgeGroup } from "@/lib/curriculum-engine";
import {
  getSelectedGameMode,
  clearSelectedGameMode,
  isLessonComplete,
  readCamperSession,
  setSelectedGameMode,
} from "@/lib/camper-session";
import { isGameModeId, type GameModeId } from "@/lib/gamification";

export default function ApplicationPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [selectedMode, setSelectedMode] = useState<GameModeId | null>(null);

  const weekNumber = getCurrentWeek();
  const camper = useMemo(() => (ready ? readCamperSession() : null), [ready]);

  useEffect(() => {
    if (!readCamperSession()) {
      router.replace("/");
      return;
    }
    if (!isLessonComplete()) {
      router.replace("/lesson");
      return;
    }

    const stored = getSelectedGameMode();
    if (stored && isGameModeId(stored)) {
      setSelectedMode(stored);
    }

    setReady(true);
  }, [router]);

  const handleModeSelect = (modeId: GameModeId) => {
    setSelectedGameMode(modeId);
    setSelectedMode(modeId);
  };

  if (!ready || !camper) {
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
            Week {weekNumber} · Practice
          </p>
          <StepRail current={3} />
        </header>

        {!selectedMode ? (
          <GameModeSelector onSelect={handleModeSelect} />
        ) : (
          <LessonCanvas
            weekNumber={weekNumber}
            ageGroup={toAgeGroup(camper.age_bracket)}
            selectedGameMode={selectedMode}
            onChangeMode={() => {
              clearSelectedGameMode();
              setSelectedMode(null);
            }}
          />
        )}
      </div>
    </main>
  );
}
