"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/animations.css";
import { FlashcardDrill } from "@/components/sentence-canvas/FlashcardDrill";
import { MatchBlitz } from "@/components/sentence-canvas/MatchBlitz";
import { RapidFire } from "@/components/sentence-canvas/RapidFire";
import { SentenceBuilder } from "@/components/sentence-canvas/SentenceBuilder";
import { PassCelebration } from "@/components/ui/PassCelebration";
import { Scoreboard } from "@/components/ui/Scoreboard";
import {
  curriculum,
  type AgeGroup,
  type Prompt,
} from "@/data/curriculum";
import {
  addSessionScore,
  getSelectedGameMode,
  readCamperSession,
} from "@/lib/camper-session";
import {
  pickTelemetryGameMode,
  resolveGameMode,
} from "@/lib/game-mode-routing";
import { markWeekCompleted, getLessonWeek } from "@/lib/curriculum-engine";
import {
  summarizeSession,
  type GameModeId,
  type ScoreResult,
  type SessionScoreSummary,
} from "@/lib/gamification";
import { PASS_THRESHOLD } from "@/lib/constants";
import { useCopy } from "@/lib/i18n/useCopy";
import { postCamperTelemetry } from "@/lib/telemetry";
import type { CamperTelemetryRow } from "@/types/sentence-canvas";
import type { GameModeCompletePayload } from "@/types/game-modes";
import type { LessonProgressState } from "@/types/lesson-progress";

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

function renderPromptMode(
  prompt: Prompt,
  selectedMode: string | null,
  onComplete: (payload: GameModeCompletePayload) => void,
) {
  const modeId = resolveGameMode(prompt, selectedMode);
  const props = { prompts: [prompt], gameModeId: modeId, onComplete };

  switch (modeId) {
    case "flashcard_drill":
      return <FlashcardDrill key={prompt.id} {...props} />;
    case "match_blitz":
      return <MatchBlitz key={prompt.id} {...props} />;
    case "rapid_fire":
      return <RapidFire key={prompt.id} {...props} />;
    case "sentence_builder":
    default:
      return <SentenceBuilder key={prompt.id} {...props} />;
  }
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
  const copy = useCopy();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="retry-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4"
    >
      <div className="w-full max-w-md rounded-3xl bg-paper p-8 shadow-bento">
        <h2 id="retry-heading" className="text-2xl font-extrabold text-ink">
          {copy.retry.title}
        </h2>
        <p className="mt-4 text-lg text-ink/80">
          {copy.retry.body(correctFirstTry, totalPrompts, PASS_THRESHOLD)}
        </p>
        <button
          type="button"
          onClick={onTryAgain}
          aria-label={copy.retry.tryAgainAria}
          className="mt-8 min-h-[64px] w-full rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-card shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          {copy.retry.tryAgain}
        </button>
      </div>
    </div>
  );
}

export function LessonCanvas({
  weekNumber,
  ageGroup,
  sessionPrompts,
  externalProgress = false,
  onProgressChange,
  onSessionStateChange,
}: LessonCanvasProps) {
  const router = useRouter();
  const copy = useCopy();
  const [promptIndex, setPromptIndex] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
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
        setShowCelebration(true);
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

      const modeId = resolveGameMode(prompt, getSelectedGameMode());
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
    setShowCelebration(false);
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

    const sessionGameMode = pickTelemetryGameMode(
      modesUsedRef.current,
      getSelectedGameMode(),
    );

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

      const saved = await postCamperTelemetry(payload);
      setTelemetryWarning(!saved);
    }

    setIsSaving(false);
    router.push("/menu");
  };

  if (!bracket) {
    return (
      <p className="rounded-3xl bg-paper p-6 text-center text-ink/70 shadow-bento">
        {copy.practice.noCurriculum(weekNumber, ageGroup)}
      </p>
    );
  }

  if (sessionComplete) {
    const sessionGameMode = pickTelemetryGameMode(
      modesUsedRef.current,
      getSelectedGameMode(),
    );

    const weekTheme = getLessonWeek(weekNumber)?.theme ?? `Week ${weekNumber}`;

    if (showCelebration) {
      return (
        <PassCelebration
          weekNumber={weekNumber}
          weekTheme={weekTheme}
          correctFirstTry={correctFirstTry}
          totalPrompts={totalPrompts}
          onContinue={() => setShowCelebration(false)}
        />
      );
    }

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
            {copy.practice.telemetryWarning}
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

  const selectedMode = getSelectedGameMode();
  const activeMode = resolveGameMode(prompt, selectedMode);

  return (
    <section className="flex flex-col">
      {!externalProgress && (
        <p className="mb-6 text-sm font-semibold text-muted-foreground">
          {copy.scoreboard.gameModes[activeMode]}
        </p>
      )}

      {renderPromptMode(prompt, selectedMode, handleModeComplete)}
    </section>
  );
}
