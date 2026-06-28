"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createSwapy, type Swapy } from "swapy";
import type { Prompt } from "@/data/curriculum";
import { setWeekPassed } from "@/lib/curriculum-engine";
import { createBrowserClient } from "@/lib/supabase/client";
import { readCamperSession } from "@/lib/camper-session";
import {
  isCorrectSelection,
  normalizeTargets,
  optionIdFor,
  parsePromptSegment,
} from "@/lib/prompt-parser";
import type {
  CamperTelemetryRow,
  FeedbackState,
  GameMode,
  SwatchColor,
} from "@/types/sentence-canvas";

const SWATCH_COLORS: SwatchColor[] = ["purple", "gold", "teal"];

const SWATCH_STYLES: Record<SwatchColor, string> = {
  purple: "bg-purple-accent hover:brightness-110",
  gold: "bg-gold-accent text-ink hover:brightness-105",
  teal: "bg-teal-accent hover:brightness-110",
};

const PASS_THRESHOLD = 80;
const SPRING = { type: "spring" as const, stiffness: 500, damping: 28 };
const INCORRECT_LOCK_MS = 500;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function ProgressBento({
  total,
  current,
  completed,
}: {
  total: number;
  current: number;
  completed: number;
}) {
  return (
    <div className="flex gap-2" aria-label={`Progress: ${completed} of ${total} prompts`}>
      {Array.from({ length: total }).map((_, index) => {
        const isDone = index < completed;
        const isActive = index === current && !isDone;
        return (
          <motion.div
            key={index}
            layout
            className={`h-3 flex-1 rounded-full ${
              isDone
                ? "bg-success-accent"
                : isActive
                  ? "bg-purple-accent"
                  : "bg-ink/10"
            }`}
            animate={isActive ? { scale: [1, 1.05, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          />
        );
      })}
    </div>
  );
}

function ConfettiOverlay() {
  const pieces = Array.from({ length: 24 }, (_, i) => i);
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((piece) => (
        <motion.span
          key={piece}
          initial={{
            opacity: 1,
            y: -20,
            x: `${(piece * 17) % 100}%`,
            rotate: 0,
          }}
          animate={{
            opacity: 0,
            y: 320,
            rotate: 360 + piece * 30,
          }}
          transition={{ duration: 1.4, delay: piece * 0.03, ease: "easeOut" }}
          className="absolute text-2xl"
        >
          {piece % 3 === 0 ? "🎉" : piece % 3 === 1 ? "✨" : "🎨"}
        </motion.span>
      ))}
    </div>
  );
}

function SuccessFlash({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="flash"
          aria-hidden
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.45, 0] }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 bg-success-accent"
        />
      )}
    </AnimatePresence>
  );
}

function FeedbackLine({
  feedback,
  incorrectLabel,
}: {
  feedback: FeedbackState;
  incorrectLabel: string;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mt-4 min-h-[1.5rem] text-sm font-semibold"
    >
      {feedback === "incorrect" && (
        <span className="text-gold-accent">{incorrectLabel}</span>
      )}
      {feedback === "correct" && (
        <span className="text-success-accent">Beautiful brushstroke!</span>
      )}
    </div>
  );
}

function DragMatchBoard({
  prompt,
  shuffledOptions,
  colors,
  feedback,
  locked,
  onAnswer,
}: {
  prompt: Prompt;
  shuffledOptions: string[];
  colors: SwatchColor[];
  feedback: FeedbackState;
  locked: boolean;
  onAnswer: (label: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<Swapy | null>(null);
  const onAnswerRef = useRef(onAnswer);
  const targets = normalizeTargets(prompt.target);
  const activeTarget = targets[0] ?? "";

  useEffect(() => {
    onAnswerRef.current = onAnswer;
  }, [onAnswer]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) {
      return;
    }
    const swapy = createSwapy(root, {
      swapMode: "drop",
      animation: "dynamic",
      autoScrollOnDrag: false,
    });
    swapy.onSwapEnd((event) => {
      const itemInBlank = event.slotItemMap.asObject.blank;
      if (!itemInBlank || itemInBlank === "placeholder") {
        return;
      }
      onAnswerRef.current(itemInBlank.replace("opt-", ""));
    });
    swapyRef.current = swapy;
    return () => {
      swapy.destroy();
      swapyRef.current = null;
    };
  }, []);

  useEffect(() => {
    swapyRef.current?.enable(!locked);
  }, [locked]);

  const segment = parsePromptSegment(prompt.text, targets, 0);
  const isWordCard = prompt.text.trim() === activeTarget;

  return (
    <div ref={rootRef} className="flex select-none flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-paper p-6 shadow-bento sm:p-10">
        <SuccessFlash show={feedback === "correct"} />
        <div className="relative z-10">
          {!isWordCard && (
            <p className="mb-3 text-sm font-semibold text-ink/60">Your sentence</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-x-1 gap-y-3 text-2xl font-bold leading-relaxed text-ink sm:text-3xl">
            {isWordCard ? (
              <span className="text-ink/70">Match: </span>
            ) : (
              <span>{segment.before}</span>
            )}
            <span
              data-swapy-slot="blank"
              className={`inline-flex min-h-[56px] min-w-[7rem] items-center justify-center rounded-2xl border-4 border-dashed px-2 transition ${
                locked
                  ? "border-success-accent bg-success-accent/10"
                  : "border-purple-accent/40"
              }`}
            >
              <span
                data-swapy-item="placeholder"
                className="inline-flex min-h-[44px] items-center justify-center px-2 text-purple-accent/50"
              >
                ···
              </span>
            </span>
            {!isWordCard && <span>{segment.after}</span>}
          </div>

          <FeedbackLine
            feedback={feedback}
            incorrectLabel="Not quite — drag another word!"
          />
          <p className="mt-1 text-xs text-ink/50">
            Drag the correct word block into the dotted blank.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {shuffledOptions.map((label, index) => {
          const isTarget = label === activeTarget;
          const optId = optionIdFor(prompt.id, label);

          if (!isTarget) {
            return (
              <div
                key={optId}
                className={`flex min-h-[56px] flex-1 cursor-not-allowed items-center justify-center rounded-3xl px-4 py-4 text-xl font-bold shadow-bento opacity-50 ${SWATCH_STYLES[colors[index % colors.length]]}`}
                aria-hidden
              >
                {label}
              </div>
            );
          }

          return (
            <div
              key={optId}
              data-swapy-slot={`tray-${index}`}
              className="flex min-h-[56px] flex-1"
            >
              <div
                data-swapy-item={`opt-${label}`}
                data-swapy-handle
                role="button"
                tabIndex={0}
                aria-label={`Drag word: ${label}`}
                className={`flex min-h-[56px] w-full cursor-grab touch-none items-center justify-center rounded-3xl px-4 py-4 text-xl font-bold text-white shadow-bento transition active:cursor-grabbing ${SWATCH_STYLES[colors[index % colors.length]]}`}
              >
                {label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SentenceCanvas({
  mode,
  prompts,
  weekNumber,
}: {
  mode: GameMode;
  prompts: Prompt[];
  weekNumber: number;
}) {
  const router = useRouter();

  const [sessionKey, setSessionKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [blankIndex, setBlankIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [telemetrySaved, setTelemetrySaved] = useState<boolean | null>(null);
  const [filledLabel, setFilledLabel] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [lockout, setLockout] = useState(false);
  const [dragNonce, setDragNonce] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);

  const finishCalledRef = useRef(false);
  const errorCountRef = useRef(0);
  const transitionLockRef = useRef(false);
  const promptErroredRef = useRef(false);

  useEffect(() => {
    errorCountRef.current = errorCount;
  }, [errorCount]);

  const totalPrompts = prompts.length;
  const prompt = prompts[currentIndex];
  const targets = useMemo(
    () => (prompt ? normalizeTargets(prompt.target) : []),
    [prompt],
  );
  const segment = prompt
    ? parsePromptSegment(prompt.text, targets, blankIndex)
    : { before: "", target: "", after: "" };
  const isLastBlankInPrompt = blankIndex >= targets.length - 1;

  const shuffledOptions = useMemo(
    () => (prompt ? shuffle(prompt.options) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, sessionKey, dragNonce, prompt?.id],
  );

  const swatchColors = useMemo(
    () =>
      shuffledOptions.map(
        (_, index) => SWATCH_COLORS[index % SWATCH_COLORS.length],
      ),
    [shuffledOptions],
  );

  useEffect(() => {
    if (!isComplete) {
      return;
    }
    const accuracy =
      totalPrompts > 0 ? (correctFirstTry / totalPrompts) * 100 : 0;
    if (accuracy >= PASS_THRESHOLD) {
      setWeekPassed(weekNumber);
      setShowConfetti(true);
    }
  }, [isComplete, correctFirstTry, totalPrompts, weekNumber]);

  useEffect(() => {
    setFilledLabel(null);
    setFeedback("idle");
    setBlankIndex(0);
    transitionLockRef.current = false;
    promptErroredRef.current = false;
  }, [currentIndex, sessionKey]);

  const finishSession = useCallback(
    async (finalScore: number, finalErrors: number) => {
      if (finishCalledRef.current || isSubmitting) {
        return;
      }
      finishCalledRef.current = true;
      setIsSubmitting(true);

      const camper = readCamperSession();
      if (!camper) {
        setTelemetrySaved(false);
        setIsComplete(true);
        return;
      }

      const payload: CamperTelemetryRow = {
        module_name: "sentence_canvas",
        score: finalScore,
        error_count: finalErrors,
        camper_id: camper.camper_id,
        display_name: camper.display_name,
        age_bracket: camper.age_bracket,
        native_language: camper.native_language,
        group_letter: camper.group_letter,
      };

      const supabase = createBrowserClient();
      if (!supabase) {
        setTelemetrySaved(false);
        setIsComplete(true);
        return;
      }

      const { error } = await supabase.from("camper_telemetry").insert(payload);
      setTelemetrySaved(!error);
      setIsComplete(true);
    },
    [isSubmitting],
  );

  const advancePrompt = useCallback(
    (nextScore: number) => {
      const isLastPrompt = currentIndex === totalPrompts - 1;
      if (isLastPrompt) {
        setIsSubmitting(true);
        window.setTimeout(() => {
          void finishSession(nextScore, errorCountRef.current);
        }, 900);
      } else {
        window.setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 900);
      }
    },
    [currentIndex, finishSession, totalPrompts],
  );

  const evaluateAnswer = useCallback(
    (selectedLabel: string) => {
      if (
        !prompt ||
        transitionLockRef.current ||
        isSubmitting ||
        isComplete ||
        feedback === "correct" ||
        lockout
      ) {
        return;
      }

      if (!isCorrectSelection(selectedLabel, segment.target)) {
        setFeedback("incorrect");
        setErrorCount((prev) => prev + 1);
        promptErroredRef.current = true;
        setLockout(true);
        window.setTimeout(() => setLockout(false), INCORRECT_LOCK_MS);
        if (mode === "drag") {
          setDragNonce((prev) => prev + 1);
        }
        return;
      }

      transitionLockRef.current = true;
      setFeedback("correct");
      setFilledLabel(selectedLabel);

      if (isLastBlankInPrompt) {
        if (!promptErroredRef.current) {
          setCorrectFirstTry((prev) => prev + 1);
        }
        const nextScore = score + 1;
        setScore(nextScore);
        advancePrompt(nextScore);
      } else {
        window.setTimeout(() => {
          setBlankIndex((prev) => prev + 1);
          setFilledLabel(null);
          setFeedback("idle");
          transitionLockRef.current = false;
        }, 900);
      }
    },
    [
      advancePrompt,
      feedback,
      isComplete,
      isLastBlankInPrompt,
      isSubmitting,
      lockout,
      mode,
      prompt,
      score,
      segment.target,
    ],
  );

  const handleReset = () => {
    finishCalledRef.current = false;
    errorCountRef.current = 0;
    transitionLockRef.current = false;
    promptErroredRef.current = false;
    setShowConfetti(false);
    setSessionKey((prev) => prev + 1);
    setCurrentIndex(0);
    setBlankIndex(0);
    setScore(0);
    setErrorCount(0);
    setCorrectFirstTry(0);
    setDragNonce(0);
    setIsSubmitting(false);
    setIsComplete(false);
    setTelemetrySaved(null);
    setFilledLabel(null);
    setFeedback("idle");
    setLockout(false);
  };

  const buttonsDisabled =
    isSubmitting || isComplete || feedback === "correct" || lockout;

  if (!prompt) {
    return null;
  }

  if (isComplete) {
    const accuracy =
      totalPrompts > 0
        ? Math.round((correctFirstTry / totalPrompts) * 100)
        : 0;
    const passed = accuracy >= PASS_THRESHOLD;

    return (
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="relative overflow-hidden rounded-3xl bg-paper p-8 shadow-bento"
      >
        {passed && showConfetti && <ConfettiOverlay />}
        {passed ? (
          <>
            <h2 className="text-3xl font-extrabold text-success-accent">
              Masterpiece! 🎉
            </h2>
            <p className="mt-2 text-xl text-ink/80">
              ¡Muy bien! You got {accuracy}% right on the first try.
            </p>
            <p className="mt-4 text-ink/70">
              Week {weekNumber} complete — the next lesson is unlocked!
            </p>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-extrabold text-purple-accent">
              Great try, Artist!
            </h2>
            <p className="mt-2 text-xl text-ink/80">
              You painted {accuracy}% on the first try — so close!
            </p>
            <p className="mt-4 text-ink/70">
              Let&apos;s practice one more time to unlock the next level. You can
              do it!
            </p>
          </>
        )}

        {telemetrySaved === false && (
          <p className="mt-4 rounded-2xl bg-gold-accent/20 px-4 py-3 text-sm text-ink/80">
            Your score is saved on this device. Connect Supabase env vars to
            share camp telemetry.
          </p>
        )}
        {telemetrySaved === true && (
          <p className="mt-4 text-sm text-teal-accent">
            Session saved for camp organizers.
          </p>
        )}

        {passed ? (
          <motion.button
            type="button"
            onClick={() => router.push("/menu")}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="mt-8 min-h-[56px] rounded-3xl bg-purple-accent px-8 py-4 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
          >
            Back to Menu — Unlock Next Lesson! 🔓
          </motion.button>
        ) : (
          <motion.button
            type="button"
            onClick={handleReset}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="mt-8 min-h-[56px] rounded-3xl bg-purple-accent px-8 py-4 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
          >
            Try Again
          </motion.button>
        )}
      </motion.section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl bg-paper p-6 shadow-bento sm:p-8">
        <ProgressBento
          total={totalPrompts}
          current={currentIndex}
          completed={currentIndex}
        />
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-teal-accent">
          Prompt {currentIndex + 1} of {totalPrompts}
          {targets.length > 1 && (
            <span className="text-ink/40">
              {" "}
              · blank {blankIndex + 1}/{targets.length}
            </span>
          )}
          <span className="ml-2 text-ink/40">
            · {mode === "drag" ? "Drag & Match" : "Click to Paint"}
          </span>
        </p>
      </div>

      {mode === "drag" ? (
        <DragMatchBoard
          key={`${sessionKey}-${currentIndex}-${dragNonce}`}
          prompt={prompt}
          shuffledOptions={shuffledOptions}
          colors={swatchColors}
          feedback={feedback}
          locked={feedback === "correct"}
          onAnswer={evaluateAnswer}
        />
      ) : (
        <>
          <div className="relative overflow-hidden rounded-3xl bg-paper p-6 shadow-bento sm:p-10">
            <SuccessFlash show={feedback === "correct"} />
            <div className="relative z-10">
              <p
                className="text-2xl font-bold leading-relaxed text-ink sm:text-3xl"
                aria-live="polite"
              >
                {segment.before}
                <span className="mx-1 inline-flex min-w-[5rem] items-center justify-center border-b-4 border-dashed border-teal-accent px-2 pb-1 align-baseline">
                  <AnimatePresence mode="wait">
                    {filledLabel ? (
                      <motion.span
                        key={filledLabel}
                        transition={SPRING}
                        className="font-extrabold text-success-accent"
                      >
                        {filledLabel}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="blank"
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: 1 }}
                        className="text-teal-accent/50"
                      >
                        ···
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                {segment.after}
              </p>

              <FeedbackLine
                feedback={feedback}
                incorrectLabel="Try another swatch!"
              />
            </div>
          </div>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            animate={
              feedback === "incorrect"
                ? { x: [0, -12, 12, -8, 8, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.45 }}
          >
            {shuffledOptions.map((label, index) => (
              <motion.button
                key={optionIdFor(prompt.id, label)}
                type="button"
                disabled={buttonsDisabled}
                onClick={() => evaluateAnswer(label)}
                aria-label={`Choose: ${label}`}
                className={`min-h-[56px] flex-1 rounded-3xl px-4 py-4 text-xl font-bold text-white shadow-bento transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${SWATCH_STYLES[swatchColors[index]]}`}
                whileHover={buttonsDisabled ? undefined : { scale: 1.04 }}
                whileTap={buttonsDisabled ? undefined : { scale: 0.96 }}
              >
                {label}
              </motion.button>
            ))}
          </motion.div>
        </>
      )}
    </section>
  );
}
