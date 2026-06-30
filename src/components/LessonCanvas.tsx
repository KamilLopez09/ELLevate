"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/animations.css";
import { FlashcardDrill } from "@/components/sentence-canvas/FlashcardDrill";
import { SentenceBuilder } from "@/components/sentence-canvas/SentenceBuilder";
import { Scoreboard } from "@/components/ui/Scoreboard";
import {
  curriculum,
  type AgeGroup,
  type Prompt,
} from "@/data/curriculum";
import {
  addSessionScore,
  readCamperSession,
} from "@/lib/camper-session";
import { markWeekCompleted } from "@/lib/curriculum-engine";
import {
  summarizeSession,
  type GameModeId,
  type ScoreResult,
  type SessionScoreSummary,
} from "@/lib/gamification";
import { createBrowserClient } from "@/lib/supabase/client";
import type { CamperTelemetryRow } from "@/types/sentence-canvas";
import type { GameModeCompletePayload } from "@/types/game-modes";
import type { LessonProgressState } from "@/types/lesson-progress";

const PASS_THRESHOLD = 8;

type NodeOutcome = "pending" | "correct" | "incorrect";

export interface LessonCanvasProps {
  weekNumber: number;
  ageGroup: AgeGroup;
  sessionPrompts?: Prompt[];
  reviewPrompts?: Prompt[];
  builderPrompts?: Prompt[];
  externalProgress?: boolean;
  onProgressChange?: (state: LessonProgressState) => void;
  onSessionStateChange?: (state: {
    sessionComplete: boolean;
    showRetryModal: boolean;
  }) => void;
}

function gameModeForPrompt(prompt: Prompt): GameModeId {
  return prompt.category === "review" ? "flashcard_drill" : "sentence_builder";
}

function RetryModal({
  correctFirstTry,
  totalPrompts,
  onTryAgain,
}: {
  correctFirstTry: number;
  totalPrompts: number;
  onTryAgain: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retry-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-bento">
        <h2 id="retry-heading" className="text-2xl font-extrabold text-ink">
          Let&apos;s Practice Again!
        </h2>
        <p className="mt-4 text-lg text-ink/80">
          You got {correctFirstTry} out of {totalPrompts}. You need {PASS_THRESHOLD}{" "}
          to move on. You can do it!
        </p>
        <button
          type="button"
          onClick={onTryAgain}
          aria-label="Try the lesson again"
          className="mt-8 min-h-[64px] w-full rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-card shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function renderPromptByCategory(
  prompt: Prompt,
  reviewPrompts: Prompt[] | undefined,
  builderPrompts: Prompt[] | undefined,
  onComplete: (payload: GameModeCompletePayload) => void,
) {
  const inReview = reviewPrompts?.some((entry) => entry.id === prompt.id);
  const inBuilder = builderPrompts?.some((entry) => entry.id === prompt.id);
  const isReview =
    inReview ?? (!inBuilder && prompt.category === "review");
  const modeId: GameModeId = isReview ? "flashcard_drill" : "sentence_builder";
  const props = { prompts: [prompt], gameModeId: modeId, onComplete };

  if (isReview) {
    return <FlashcardDrill key={prompt.id} {...props} />;
  }

  return <SentenceBuilder key={prompt.id} {...props} />;
}

export function LessonCanvas({
  weekNumber,
  ageGroup,
  sessionPrompts,
  reviewPrompts,
  builderPrompts,
  externalProgress = false,
  onProgressChange,
  onSessionStateChange,
}: LessonCanvasProps) {
  const router = useRouter();
  const [promptIndex, setPromptIndex] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [telemetryWarning, setTelemetryWarning] = useState(false);

  const bracket = useMemo(() => {
    const week = curriculum[weekNumber];
    const base = week?.brackets[ageGroup] ?? null;
    if (!base) {
      return null;
    }
    if (sessionPrompts) {
      return { ...base, prompts: sessionPrompts };
    }
    return base;
  }, [weekNumber, ageGroup, sessionPrompts]);

  const totalPrompts = bracket?.prompts.length ?? 0;

  const outcomesRef = useRef<NodeOutcome[]>([]);
  const scoreResultsRef = useRef<ScoreResult[]>([]);
  const modesUsedRef = useRef<Set<GameModeId>>(new Set());
  const errorCountRef = useRef(0);
  const weekCompletedRef = useRef(false);
  const [outcomeVersion, bumpOutcomes] = useState(0);

  useEffect(() => {
    outcomesRef.current = Array.from({ length: totalPrompts }, () => "pending");
    bumpOutcomes((value) => value + 1);
  }, [totalPrompts, weekNumber, ageGroup]);

  const prompt = bracket?.prompts[promptIndex] ?? null;
  const showRetryModal =
    totalPrompts > 0 && promptIndex >= totalPrompts && !sessionComplete;

  useEffect(() => {
    weekCompletedRef.current = false;
  }, [weekNumber]);

  const sessionSummary: SessionScoreSummary = useMemo(
    () => summarizeSession(scoreResultsRef.current, correctFirstTry),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ref syncs when promptIndex/sessionComplete changes
    [correctFirstTry, sessionComplete, promptIndex],
  );

  const sessionPoints = sessionSummary.totalPoints;

  const refreshOutcomes = useCallback(() => {
    bumpOutcomes((value) => value + 1);
  }, []);

  useEffect(() => {
    onProgressChange?.({
      promptIndex,
      outcomes: [...outcomesRef.current],
    });
  }, [onProgressChange, promptIndex, outcomeVersion]);

  useEffect(() => {
    onSessionStateChange?.({ sessionComplete, showRetryModal });
  }, [onSessionStateChange, sessionComplete, showRetryModal]);

  const resetSession = useCallback(() => {
    outcomesRef.current = Array.from({ length: totalPrompts }, () => "pending");
    scoreResultsRef.current = [];
    modesUsedRef.current = new Set();
    errorCountRef.current = 0;
    refreshOutcomes();
  }, [refreshOutcomes, totalPrompts]);

  const finishGate = useCallback(
    (firstTryScore: number) => {
      if (firstTryScore >= PASS_THRESHOLD) {
        setSessionComplete(true);
        if (!weekCompletedRef.current) {
          weekCompletedRef.current = true;
          markWeekCompleted(weekNumber);
        }
      }
      setPromptIndex(totalPrompts);
    },
    [totalPrompts, weekNumber],
  );

  const handleModeComplete = useCallback(
    (payload: GameModeCompletePayload) => {
      if (totalPrompts === 0 || promptIndex >= totalPrompts || !prompt) {
        return;
      }

      const modeId = gameModeForPrompt(prompt);
      modesUsedRef.current.add(modeId);
      scoreResultsRef.current.push(payload.scoreResult);
      addSessionScore(payload.scoreResult.total, modeId);

      if (!payload.correct) {
        errorCountRef.current += 1;
      }

      outcomesRef.current[promptIndex] =
        payload.correct && payload.firstTry ? "correct" : "incorrect";
      refreshOutcomes();

      const nextFirstTryScore =
        payload.correct && payload.firstTry
          ? correctFirstTry + 1
          : correctFirstTry;

      if (payload.correct && payload.firstTry) {
        setCorrectFirstTry(nextFirstTryScore);
      }

      const nextIndex = promptIndex + 1;
      if (nextIndex >= totalPrompts) {
        finishGate(nextFirstTryScore);
        return;
      }

      setPromptIndex(nextIndex);
    },
    [
      correctFirstTry,
      finishGate,
      prompt,
      promptIndex,
      refreshOutcomes,
      totalPrompts,
    ],
  );

  const handleTryAgain = () => {
    setPromptIndex(0);
    setCorrectFirstTry(0);
    setSessionComplete(false);
    setRetryCount((count) => count + 1);
    weekCompletedRef.current = false;
    resetSession();
  };

  const handleReturnToMenu = async () => {
    setIsSaving(true);

    const camper = readCamperSession();
    const accuracyRate =
      totalPrompts > 0
        ? Number(((correctFirstTry / totalPrompts) * 100).toFixed(2))
        : 0;

    const sessionGameMode: GameModeId = modesUsedRef.current.has(
      "sentence_builder",
    )
      ? "sentence_builder"
      : "flashcard_drill";

    if (camper) {
      const payload: CamperTelemetryRow = {
        module_name: "sentence_canvas",
        score: correctFirstTry,
        error_count: errorCountRef.current,
        game_mode: sessionGameMode,
        base_points: sessionSummary.results.reduce(
          (sum, result) => sum + result.base,
          0,
        ),
        first_try_bonus: sessionSummary.totalFirstTryBonus,
        speed_bonus: sessionSummary.totalSpeedBonus,
        total_points: sessionSummary.totalPoints,
        week_number: weekNumber,
        correct_first_try: correctFirstTry,
        cumulative_score: camper.cumulativeScore,
        speed_bonuses_earned: sessionSummary.totalSpeedBonus,
        accuracy_rate: accuracyRate,
        camper_id: camper.camper_id,
        first_name: camper.first_name,
        last_initial: camper.last_initial,
        age_bracket: camper.age_bracket,
        native_language: camper.native_language,
        group_letter: camper.group_letter,
      };

      const supabase = createBrowserClient();
      if (supabase) {
        const { error } = await supabase
          .from("camper_telemetry")
          .insert(payload);
        setTelemetryWarning(Boolean(error));
      } else {
        setTelemetryWarning(true);
      }
    }

    setIsSaving(false);
    router.push("/menu");
  };

  if (!bracket) {
    return (
      <p className="rounded-3xl bg-paper p-6 text-center text-ink/70 shadow-bento">
        No curriculum found for week {weekNumber}, age {ageGroup}.
      </p>
    );
  }

  if (sessionComplete) {
    const sessionGameMode: GameModeId = modesUsedRef.current.has(
      "sentence_builder",
    )
      ? "sentence_builder"
      : "flashcard_drill";

    return (
      <>
        <Scoreboard
          summary={sessionSummary}
          sessionPoints={sessionPoints}
          retryCount={retryCount}
          gameMode={sessionGameMode}
          onReturnToMenu={() => void handleReturnToMenu()}
          isSaving={isSaving}
        />
        {telemetryWarning && (
          <p className="mt-4 rounded-2xl bg-gold-accent/20 px-4 py-3 text-center text-sm text-ink/80">
            Your score is saved on this device. Connect Supabase env vars to
            share camp telemetry.
          </p>
        )}
      </>
    );
  }

  if (showRetryModal) {
    return (
      <RetryModal
        correctFirstTry={correctFirstTry}
        totalPrompts={totalPrompts}
        onTryAgain={handleTryAgain}
      />
    );
  }

  if (!prompt) {
    return null;
  }

  return (
    <section className="flex flex-col">
      {!externalProgress && (
        <p className="mb-6 text-sm font-semibold text-muted-foreground">
          {prompt.category === "review"
            ? "Review · Flashcard Drill"
            : "Practice · Sentence Builder"}
        </p>
      )}

      {renderPromptByCategory(
        prompt,
        reviewPrompts,
        builderPrompts,
        handleModeComplete,
      )}
    </section>
  );
}
