"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createSwapy, type Swapy } from "swapy";
import { SENTENCE_PROMPTS } from "@/data/sentence-prompts";
import { createBrowserClient } from "@/lib/supabase/client";
import { readCamperSession, setLesson1Passed } from "@/lib/camper-session";
import type {
  CamperTelemetryRow,
  FeedbackState,
  GameMode,
  SentencePrompt,
  SwatchColor,
  VerbOption,
} from "@/types/sentence-canvas";

const SWATCH_COLORS: SwatchColor[] = ["purple", "gold", "teal"];

const SWATCH_STYLES: Record<SwatchColor, string> = {
  purple: "bg-purple-accent hover:brightness-110",
  gold: "bg-gold-accent text-ink hover:brightness-105",
  teal: "bg-teal-accent hover:brightness-110",
};

const PASS_THRESHOLD = 80;
const SPRING = { type: "spring" as const, stiffness: 500, damping: 28 };

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
    <div className="flex gap-2" aria-label={`Progress: ${completed} of ${total} sentences`}>
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

function PaintSwatch({
  option,
  color,
  disabled,
  hidden,
  onSelect,
}: {
  option: VerbOption;
  color: SwatchColor;
  disabled: boolean;
  hidden: boolean;
  onSelect: (optionId: string) => void;
}) {
  if (hidden) {
    return null;
  }

  return (
    <motion.button
      type="button"
      layoutId={`verb-${option.id}`}
      disabled={disabled}
      onClick={() => onSelect(option.id)}
      aria-label={`Choose verb: ${option.label}`}
      className={`min-h-[56px] flex-1 rounded-3xl px-4 py-4 text-xl font-bold text-white shadow-bento transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${SWATCH_STYLES[color]}`}
      whileHover={disabled ? undefined : { scale: 1.04 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
    >
      {option.label}
    </motion.button>
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

/**
 * Drag & Match mechanic powered by Swapy. The blank in the sentence is a Swapy
 * slot; each answer is a draggable item in its own tray slot. Dropping a word in
 * the blank fires `onAnswer`. The board is remounted (via a parent `key`) between
 * sentences and after a wrong attempt, so Swapy always starts from a clean DOM
 * — this avoids React reconciliation fighting Swapy's manual node moves.
 */
function DragMatchBoard({
  prompt,
  options,
  colors,
  feedback,
  locked,
  onAnswer,
}: {
  prompt: SentencePrompt;
  options: VerbOption[];
  colors: SwatchColor[];
  feedback: FeedbackState;
  locked: boolean;
  onAnswer: (optionId: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<Swapy | null>(null);
  const onAnswerRef = useRef(onAnswer);

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

  return (
    <div ref={rootRef} className="flex select-none flex-col gap-6">
      <div className="relative overflow-hidden rounded-3xl bg-paper p-6 shadow-bento sm:p-10">
        <SuccessFlash show={feedback === "correct"} />
        <div className="relative z-10">
          <p className="mb-3 text-sm font-semibold text-ink/60">Spanish hint</p>
          <p className="text-lg italic text-ink/70">{prompt.spanishHint}</p>

          <div className="mt-8 flex flex-wrap items-center gap-x-1 gap-y-3 text-2xl font-bold leading-relaxed text-ink sm:text-3xl">
            <span>{prompt.englishBefore}</span>
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
            <span>{prompt.englishAfter}</span>
          </div>

          <FeedbackLine
            feedback={feedback}
            incorrectLabel="Not quite — drag another word!"
          />
          <p className="mt-1 text-xs text-ink/50">
            Drag a word block into the dotted blank.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        {options.map((option, index) => (
          <div
            key={option.id}
            data-swapy-slot={`tray-${index}`}
            className="flex min-h-[56px] flex-1"
          >
            <div
              data-swapy-item={`opt-${option.id}`}
              data-swapy-handle
              role="button"
              tabIndex={0}
              aria-label={`Drag verb: ${option.label}`}
              className={`flex min-h-[56px] w-full cursor-grab touch-none items-center justify-center rounded-3xl px-4 py-4 text-xl font-bold text-white shadow-bento transition active:cursor-grabbing ${SWATCH_STYLES[colors[index]]}`}
            >
              {option.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SentenceCanvas({ mode }: { mode: GameMode }) {
  const router = useRouter();

  const [sessionKey, setSessionKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [correctFirstTry, setCorrectFirstTry] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [telemetrySaved, setTelemetrySaved] = useState<boolean | null>(null);
  const [filledVerb, setFilledVerb] = useState<VerbOption | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [hiddenOptionId, setHiddenOptionId] = useState<string | null>(null);
  // Bumping this remounts the Drag & Match board so a wrong word slides back.
  const [dragNonce, setDragNonce] = useState(0);

  const finishCalledRef = useRef(false);
  const errorCountRef = useRef(0);
  // Synchronous re-entrancy guard. State updates (isSubmitting/feedback) are
  // async, so a fast double-tap can pass the state-based check twice in the same
  // render. This ref flips synchronously the instant a correct answer is
  // accepted, blocking duplicate handling before React re-renders.
  const transitionLockRef = useRef(false);
  // Tracks whether the current sentence has had a wrong attempt, so we only
  // credit "first try" accuracy when it was solved cleanly.
  const sentenceErroredRef = useRef(false);

  useEffect(() => {
    errorCountRef.current = errorCount;
  }, [errorCount]);

  const totalSentencesCount = SENTENCE_PROMPTS.length;
  useEffect(() => {
    if (!isComplete) {
      return;
    }
    const accuracy =
      totalSentencesCount > 0
        ? (correctFirstTry / totalSentencesCount) * 100
        : 0;
    if (accuracy >= PASS_THRESHOLD) {
      setLesson1Passed();
    }
  }, [isComplete, correctFirstTry, totalSentencesCount]);

  const prompt = SENTENCE_PROMPTS[currentIndex];
  const totalSentences = SENTENCE_PROMPTS.length;

  // Stable per "generation" (sentence + reset). Reshuffles on sentence change,
  // session reset, and — in drag mode — each wrong-attempt remount.
  const shuffledOptions = useMemo(
    () => shuffle(prompt.options),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentIndex, sessionKey, dragNonce],
  );

  const swatchColors = useMemo(
    () =>
      shuffledOptions.map(
        (_, index) => SWATCH_COLORS[index % SWATCH_COLORS.length],
      ),
    [shuffledOptions],
  );

  useEffect(() => {
    setFilledVerb(null);
    setFeedback("idle");
    setHiddenOptionId(null);
    transitionLockRef.current = false;
    sentenceErroredRef.current = false;
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
        // No intake data means the gatekeeper was bypassed; skip telemetry
        // rather than write an orphaned, non-attributable row.
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

  const evaluateAnswer = useCallback(
    (optionId: string) => {
      if (
        transitionLockRef.current ||
        isSubmitting ||
        isComplete ||
        feedback === "correct"
      ) {
        return;
      }

      if (optionId !== prompt.correctOptionId) {
        setFeedback("incorrect");
        setErrorCount((prev) => prev + 1);
        sentenceErroredRef.current = true;
        if (mode === "drag") {
          // Slide the wrong word back to the tray with a fresh board.
          setDragNonce((prev) => prev + 1);
        }
        return;
      }

      transitionLockRef.current = true;
      setFeedback("correct");
      const chosen = shuffledOptions.find((o) => o.id === optionId) ?? null;
      setFilledVerb(chosen);
      setHiddenOptionId(optionId);

      if (!sentenceErroredRef.current) {
        setCorrectFirstTry((prev) => prev + 1);
      }

      const nextScore = score + 1;
      setScore(nextScore);

      const isLastSentence = currentIndex === totalSentences - 1;
      if (isLastSentence) {
        setIsSubmitting(true);
      }

      window.setTimeout(() => {
        if (isLastSentence) {
          void finishSession(nextScore, errorCountRef.current);
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      }, 900);
    },
    [
      currentIndex,
      feedback,
      finishSession,
      isComplete,
      isSubmitting,
      mode,
      prompt.correctOptionId,
      score,
      shuffledOptions,
      totalSentences,
    ],
  );

  const handleReset = () => {
    finishCalledRef.current = false;
    errorCountRef.current = 0;
    transitionLockRef.current = false;
    sentenceErroredRef.current = false;
    setSessionKey((prev) => prev + 1);
    setCurrentIndex(0);
    setScore(0);
    setErrorCount(0);
    setCorrectFirstTry(0);
    setDragNonce(0);
    setIsSubmitting(false);
    setIsComplete(false);
    setTelemetrySaved(null);
    setFilledVerb(null);
    setFeedback("idle");
    setHiddenOptionId(null);
  };

  const buttonsDisabled = isSubmitting || isComplete || feedback === "correct";

  if (isComplete) {
    const accuracy =
      totalSentences > 0
        ? Math.round((correctFirstTry / totalSentences) * 100)
        : 0;
    const passed = accuracy >= PASS_THRESHOLD;

    return (
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-3xl bg-paper p-8 shadow-bento"
      >
        {passed ? (
          <>
            <h2 className="text-3xl font-extrabold text-success-accent">
              Masterpiece! 🎉
            </h2>
            <p className="mt-2 text-xl text-ink/80">
              ¡Muy bien! You got {accuracy}% right on the first try.
            </p>
            <p className="mt-4 text-ink/70">
              You finished all {totalSentences} sentences and unlocked the next
              lesson.
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
          total={totalSentences}
          current={currentIndex}
          completed={currentIndex}
        />
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-teal-accent">
          Sentence {currentIndex + 1} of {totalSentences}
          <span className="ml-2 text-ink/40">
            · {mode === "drag" ? "Drag & Match" : "Click to Paint"}
          </span>
        </p>
      </div>

      {mode === "drag" ? (
        <DragMatchBoard
          key={`${sessionKey}-${currentIndex}-${dragNonce}`}
          prompt={prompt}
          options={shuffledOptions}
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
              <p className="mb-3 text-sm font-semibold text-ink/60">
                Spanish hint
              </p>
              <p className="text-lg italic text-ink/70">{prompt.spanishHint}</p>

              <p
                className="mt-8 text-2xl font-bold leading-relaxed text-ink sm:text-3xl"
                aria-live="polite"
              >
                {prompt.englishBefore}
                <span className="mx-1 inline-flex min-w-[5rem] items-center justify-center border-b-4 border-dashed border-purple-accent/40 px-2 pb-1 align-baseline">
                  <AnimatePresence mode="wait">
                    {filledVerb ? (
                      <motion.span
                        key={filledVerb.id}
                        layoutId={`verb-${filledVerb.id}`}
                        transition={SPRING}
                        className="font-extrabold text-success-accent"
                      >
                        {filledVerb.label}
                      </motion.span>
                    ) : (
                      <motion.span
                        key="blank"
                        initial={{ opacity: 0.4 }}
                        animate={{ opacity: 1 }}
                        className="text-purple-accent/50"
                      >
                        ···
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
                {prompt.englishAfter}
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
            {shuffledOptions.map((option, index) => (
              <PaintSwatch
                key={option.id}
                option={option}
                color={swatchColors[index]}
                disabled={buttonsDisabled}
                hidden={hiddenOptionId === option.id}
                onSelect={evaluateAnswer}
              />
            ))}
          </motion.div>
        </>
      )}
    </section>
  );
}
