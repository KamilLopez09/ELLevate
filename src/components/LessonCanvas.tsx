"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import "@/styles/animations.css";
import {
  curriculum,
  type AgeGroup,
  type ClickPaintPrompt,
  type DragMatchPrompt,
  type Prompt,
} from "@/data/curriculum";
import { readCamperSession } from "@/lib/camper-session";
import { setWeekPassed } from "@/lib/curriculum-engine";
import { createBrowserClient } from "@/lib/supabase/client";
import type { CamperTelemetryRow } from "@/types/sentence-canvas";

const TOTAL_PROMPTS = 10;
const PASS_THRESHOLD = 8;
const ADVANCE_DELAY_MS = 600;

type NodeOutcome = "pending" | "correct" | "incorrect";

export interface LessonCanvasProps {
  weekNumber: number;
  ageGroup: AgeGroup;
}

function isDragMatchPrompt(prompt: Prompt): prompt is DragMatchPrompt {
  return prompt.mode === "drag-match";
}

function isClickPaintPrompt(prompt: Prompt): prompt is ClickPaintPrompt {
  return prompt.mode === "click-paint";
}

function isAnswerCorrect(prompt: Prompt, answer: string): boolean {
  if (isDragMatchPrompt(prompt)) {
    return answer === prompt.target;
  }
  const targets = Array.isArray(prompt.target)
    ? prompt.target
    : [prompt.target];
  return targets.includes(answer);
}

function imagePlaceholderClass(key: string): string {
  const palettes = [
    "bg-purple-accent/30",
    "bg-teal-accent/30",
    "bg-gold-accent/40",
  ];
  const index =
    key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    palettes.length;
  return palettes[index];
}

function ProgressRail({
  promptIndex,
  outcomes,
}: {
  promptIndex: number;
  outcomes: NodeOutcome[];
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.min(promptIndex, TOTAL_PROMPTS)}
      aria-valuemin={0}
      aria-valuemax={TOTAL_PROMPTS}
      aria-label="Lesson progress"
      className="flex items-center justify-center gap-2"
    >
      {outcomes.map((outcome, index) => {
        const isActive = index === promptIndex && promptIndex < TOTAL_PROMPTS;
        let className =
          "flex h-8 w-8 items-center justify-center rounded-full border-2 bg-white border-ink/20";

        if (outcome === "correct") {
          className =
            "flex h-8 w-8 items-center justify-center rounded-full bg-teal-accent text-sm font-bold text-white";
        } else if (outcome === "incorrect") {
          className =
            "flex h-8 w-8 items-center justify-center rounded-full bg-red-300/60 border-2 border-red-300/80";
        } else if (isActive) {
          className =
            "flex h-8 w-8 items-center justify-center rounded-full border-2 border-teal-accent bg-white animate-pulse-ring";
        }

        return (
          <div key={index} aria-hidden={!isActive} className={className}>
            {outcome === "correct" && "✓"}
          </div>
        );
      })}
    </div>
  );
}

function CategoryBadge({ category }: { category: Prompt["category"] }) {
  if (category !== "review") {
    return null;
  }
  return (
    <p className="mb-3 text-sm font-bold uppercase tracking-widest text-teal-accent">
      Review ✦
    </p>
  );
}

function ImageCard({
  imageKey,
  onDragStart,
  feedbackClass,
}: {
  imageKey: string;
  onDragStart: (event: React.DragEvent<HTMLDivElement>, key: string) => void;
  feedbackClass: string;
}) {
  return (
    <div
      draggable
      onDragStart={(event) => onDragStart(event, imageKey)}
      aria-label={`Drag picture ${imageKey}`}
      className={`min-h-[56px] flex-1 cursor-grab rounded-2xl border-2 border-ink/10 shadow-bento active:cursor-grabbing ${imagePlaceholderClass(imageKey)} ${feedbackClass}`}
    />
  );
}

function SuccessScreen({
  retryCount,
  onNextLesson,
}: {
  retryCount: number;
  onNextLesson: () => void;
}) {
  const stars = retryCount > 0 ? 1 : 3;

  return (
    <section className="flex flex-col items-center rounded-3xl bg-paper p-8 text-center shadow-bento">
      <div className="animate-checkmark-pop mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-teal-accent/15">
        <svg
          viewBox="0 0 52 52"
          className="h-16 w-16"
          aria-hidden
        >
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-teal-accent/30"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27 l8 8 l16-18"
            className="animate-checkmark-draw text-teal-accent"
          />
        </svg>
      </div>
      <h2 className="text-3xl font-extrabold text-ink">Great work!</h2>
      <p className="mt-4 text-lg text-ink/70">
        Stars earned: {"★".repeat(stars)}
        {"☆".repeat(3 - stars)}
      </p>
      <button
        type="button"
        onClick={onNextLesson}
        aria-label="Go to next lesson"
        className="mt-8 min-h-[56px] rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
      >
        Next Lesson
      </button>
    </section>
  );
}

function RetryModal({
  correctFirstTry,
  onTryAgain,
}: {
  correctFirstTry: number;
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
          You got {correctFirstTry} out of 10. You need 8 to move on. You can do
          it!
        </p>
        <button
          type="button"
          onClick={onTryAgain}
          aria-label="Try the lesson again"
          className="mt-8 min-h-[56px] w-full rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export function LessonCanvas({ weekNumber, ageGroup }: LessonCanvasProps) {
  const router = useRouter();
  const [promptIndex, setPromptIndex] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [feedbackClass, setFeedbackClass] = useState("");
  const [filledAnswer, setFilledAnswer] = useState<string | null>(null);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const outcomesRef = useRef<NodeOutcome[]>(
    Array.from({ length: TOTAL_PROMPTS }, () => "pending"),
  );
  const [, bumpOutcomes] = useState(0);
  const [telemetrySaved, setTelemetrySaved] = useState<boolean | null>(null);
  const errorCountRef = useRef(0);

  const bracket = useMemo(() => {
    const week = curriculum[weekNumber];
    return week?.brackets[ageGroup] ?? null;
  }, [weekNumber, ageGroup]);

  const prompt = bracket?.prompts[promptIndex] ?? null;
  const showRetryModal = promptIndex === TOTAL_PROMPTS && !sessionComplete;

  const refreshOutcomes = useCallback(() => {
    bumpOutcomes((value) => value + 1);
  }, []);

  const resetOutcomes = useCallback(() => {
    outcomesRef.current = Array.from({ length: TOTAL_PROMPTS }, () => "pending");
    refreshOutcomes();
  }, [refreshOutcomes]);

  const finishGate = useCallback(
    (firstTryScore: number) => {
      if (firstTryScore >= PASS_THRESHOLD) {
        setSessionComplete(true);
        setPromptIndex(TOTAL_PROMPTS);
        setWeekPassed(weekNumber);
      } else {
        setPromptIndex(TOTAL_PROMPTS);
      }
    },
    [weekNumber],
  );

  const advancePrompt = useCallback(
    (firstTryScore: number) => {
      const nextIndex = promptIndex + 1;
      if (nextIndex >= TOTAL_PROMPTS) {
        finishGate(firstTryScore);
        return;
      }
      setPromptIndex(nextIndex);
      setHasAttempted(false);
      setFilledAnswer(null);
      setFeedbackClass("");
      setIsAdvancing(false);
    },
    [finishGate, promptIndex],
  );

  const handleCorrect = useCallback(
    (currentPrompt: Prompt, firstTryScore: number) => {
      outcomesRef.current[promptIndex] = hasAttempted ? "incorrect" : "correct";
      refreshOutcomes();
      setFeedbackClass("animate-spring");
      setIsAdvancing(true);

      window.setTimeout(() => {
        advancePrompt(firstTryScore);
      }, ADVANCE_DELAY_MS);
    },
    [advancePrompt, hasAttempted, promptIndex, refreshOutcomes],
  );

  const handleIncorrect = useCallback(() => {
    setHasAttempted(true);
    errorCountRef.current += 1;
    setFeedbackClass("animate-shake");
    window.setTimeout(() => setFeedbackClass(""), 400);
  }, []);

  const evaluateAnswer = useCallback(
    (answer: string) => {
      if (!prompt || isAdvancing || promptIndex >= TOTAL_PROMPTS) {
        return;
      }

      if (isAnswerCorrect(prompt, answer)) {
        const nextFirstTryScore =
          !hasAttempted ? correctFirstTry + 1 : correctFirstTry;
        if (!hasAttempted) {
          setCorrectFirstTry(nextFirstTryScore);
        }
        setFilledAnswer(answer);
        handleCorrect(prompt, nextFirstTryScore);
      } else {
        handleIncorrect();
      }
    },
    [
      correctFirstTry,
      handleCorrect,
      handleIncorrect,
      hasAttempted,
      isAdvancing,
      prompt,
      promptIndex,
    ],
  );

  const handleTryAgain = () => {
    setPromptIndex(0);
    setCorrectFirstTry(0);
    setHasAttempted(false);
    setRetryCount((count) => count + 1);
    setFilledAnswer(null);
    setFeedbackClass("");
    setIsAdvancing(false);
    errorCountRef.current = 0;
    resetOutcomes();
  };

  const saveTelemetry = useCallback(async (score: number) => {
    const camper = readCamperSession();
    if (!camper) {
      setTelemetrySaved(false);
      return;
    }

    const payload: CamperTelemetryRow = {
      module_name: "sentence_canvas",
      score,
      error_count: errorCountRef.current,
      camper_id: camper.camper_id,
      display_name: camper.display_name,
      age_bracket: camper.age_bracket,
      native_language: camper.native_language,
      group_letter: camper.group_letter,
    };

    const supabase = createBrowserClient();
    if (!supabase) {
      setTelemetrySaved(false);
      return;
    }

    const { error } = await supabase.from("camper_telemetry").insert(payload);
    setTelemetrySaved(!error);
  }, []);

  useEffect(() => {
    if (!sessionComplete) {
      return;
    }
    void saveTelemetry(correctFirstTry);
  }, [correctFirstTry, saveTelemetry, sessionComplete]);

  const handleNextLesson = () => {
    router.push("/menu");
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    key: string,
  ) => {
    event.dataTransfer.setData("text/plain", key);
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const key = event.dataTransfer.getData("text/plain");
    if (key) {
      evaluateAnswer(key);
    }
  };

  if (!bracket) {
    return (
      <p className="rounded-3xl bg-paper p-6 text-center text-ink/70 shadow-bento">
        No curriculum found for week {weekNumber}, age {ageGroup}.
      </p>
    );
  }

  if (sessionComplete) {
    return (
      <>
        <SuccessScreen retryCount={retryCount} onNextLesson={handleNextLesson} />
        {telemetrySaved === false && (
          <p className="mt-4 rounded-2xl bg-gold-accent/20 px-4 py-3 text-center text-sm text-ink/80">
            Your score is saved on this device. Connect Supabase env vars to
            share camp telemetry.
          </p>
        )}
      </>
    );
  }

  if (!prompt) {
    return null;
  }

  const clickParts = isClickPaintPrompt(prompt)
    ? prompt.text.split("___")
    : null;

  return (
    <>
      {showRetryModal && (
        <RetryModal
          correctFirstTry={correctFirstTry}
          onTryAgain={handleTryAgain}
        />
      )}

      <section className="flex flex-col gap-6 rounded-3xl bg-paper p-6 shadow-bento sm:p-8">
        <ProgressRail
          promptIndex={promptIndex}
          outcomes={outcomesRef.current}
        />

        <CategoryBadge category={prompt.category} />

        {isClickPaintPrompt(prompt) && clickParts && (
          <div>
            <p
              className={`text-2xl font-bold leading-relaxed text-ink sm:text-3xl ${feedbackClass}`}
              aria-live="polite"
            >
              {clickParts[0]}
              <span className="mx-1 inline-flex min-h-[56px] min-w-[5rem] items-center justify-center rounded-xl border-2 border-dashed border-teal-accent px-2 align-middle">
                {filledAnswer ?? "___"}
              </span>
              {clickParts[1] ?? ""}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {prompt.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={isAdvancing}
                  aria-label={`Choose answer ${option}`}
                  onClick={() => evaluateAnswer(option)}
                  className="min-h-[56px] flex-1 rounded-2xl bg-purple-accent px-4 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        )}

        {isDragMatchPrompt(prompt) && (
          <div>
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              aria-label={`Drop zone for ${prompt.wordLabel}`}
              className={`mx-auto flex min-h-[56px] w-full max-w-md items-center justify-center rounded-3xl border-4 border-dashed border-purple-accent/40 bg-camp-blue/30 px-6 py-8 text-center ${feedbackClass}`}
            >
              <p className="text-3xl font-extrabold text-ink sm:text-4xl">
                {prompt.wordLabel}
              </p>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {prompt.imageOptions.map((imageKey) => (
                <ImageCard
                  key={imageKey}
                  imageKey={imageKey}
                  onDragStart={handleDragStart}
                  feedbackClass=""
                />
              ))}
            </div>
          </div>
        )}
      </section>
    </>
  );
}
