"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SENTENCE_PROMPTS } from "@/data/sentence-prompts";
import { createBrowserClient } from "@/lib/supabase/client";
import type {
  CamperTelemetryRow,
  FeedbackState,
  SwatchColor,
  VerbOption,
} from "@/types/sentence-canvas";

const SWATCH_COLORS: SwatchColor[] = ["purple", "gold", "teal"];

const SWATCH_STYLES: Record<SwatchColor, string> = {
  purple: "bg-purple-accent hover:brightness-110",
  gold: "bg-gold-accent text-ink hover:brightness-105",
  teal: "bg-teal-accent hover:brightness-110",
};

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
  onSelect: (option: VerbOption) => void;
}) {
  if (hidden) {
    return null;
  }

  return (
    <motion.button
      type="button"
      layoutId={`verb-${option.id}`}
      disabled={disabled}
      onClick={() => onSelect(option)}
      aria-label={`Choose verb: ${option.label}`}
      className={`min-h-[56px] flex-1 rounded-3xl px-4 py-4 text-xl font-bold text-white shadow-bento transition disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${SWATCH_STYLES[color]}`}
      whileTap={disabled ? undefined : { scale: 0.96 }}
    >
      {option.label}
    </motion.button>
  );
}

export function SentenceCanvas() {
  const [sessionKey, setSessionKey] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [telemetrySaved, setTelemetrySaved] = useState<boolean | null>(null);
  const [filledVerb, setFilledVerb] = useState<VerbOption | null>(null);
  const [feedback, setFeedback] = useState<FeedbackState>("idle");
  const [hiddenOptionId, setHiddenOptionId] = useState<string | null>(null);
  const [shuffledOptions, setShuffledOptions] = useState<VerbOption[]>([]);

  const finishCalledRef = useRef(false);
  const errorCountRef = useRef(0);

  useEffect(() => {
    errorCountRef.current = errorCount;
  }, [errorCount]);

  const prompt = SENTENCE_PROMPTS[currentIndex];
  const totalSentences = SENTENCE_PROMPTS.length;

  useEffect(() => {
    setShuffledOptions(shuffle(prompt.options));
    setFilledVerb(null);
    setFeedback("idle");
    setHiddenOptionId(null);
  }, [currentIndex, sessionKey, prompt.options]);

  const swatchColors = useMemo(
    () =>
      shuffledOptions.map(
        (_, index) => SWATCH_COLORS[index % SWATCH_COLORS.length],
      ),
    [shuffledOptions],
  );

  const finishSession = useCallback(
    async (finalScore: number, finalErrors: number) => {
      if (finishCalledRef.current || isSubmitting) {
        return;
      }
      finishCalledRef.current = true;
      setIsSubmitting(true);

      const payload: CamperTelemetryRow = {
        module_name: "sentence_canvas",
        score: finalScore,
        error_count: finalErrors,
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

  const handleSelect = useCallback(
    (option: VerbOption) => {
      if (isSubmitting || isComplete || feedback === "correct") {
        return;
      }

      if (option.id !== prompt.correctOptionId) {
        setFeedback("incorrect");
        setErrorCount((prev) => prev + 1);
        return;
      }

      setFeedback("correct");
      setFilledVerb(option);
      setHiddenOptionId(option.id);

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
      errorCount,
      feedback,
      finishSession,
      isComplete,
      isSubmitting,
      prompt.correctOptionId,
      score,
      totalSentences,
    ],
  );

  const handleReset = () => {
    finishCalledRef.current = false;
    errorCountRef.current = 0;
    setSessionKey((prev) => prev + 1);
    setCurrentIndex(0);
    setScore(0);
    setErrorCount(0);
    setIsSubmitting(false);
    setIsComplete(false);
    setTelemetrySaved(null);
    setFilledVerb(null);
    setFeedback("idle");
    setHiddenOptionId(null);
  };

  const buttonsDisabled =
    isSubmitting || isComplete || feedback === "correct";

  if (isComplete) {
    return (
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={SPRING}
        className="rounded-3xl bg-white/80 p-8 shadow-bento backdrop-blur-sm"
      >
        <h2 className="text-3xl font-extrabold text-success-accent">
          Canvas Complete!
        </h2>
        <p className="mt-2 text-xl text-ink/80">
          ¡Muy bien! You painted {score} of {totalSentences} sentences.
        </p>
        <p className="mt-4 text-ink/70">
          {errorCount === 0
            ? "Perfect brushstrokes — no mistakes!"
            : `You explored ${errorCount} extra swatch${errorCount === 1 ? "" : "es"} along the way.`}
        </p>
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
        <button
          type="button"
          onClick={handleReset}
          className="mt-8 min-h-[52px] rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
        >
          Paint again
        </button>
      </motion.section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="rounded-3xl bg-white/80 p-6 shadow-bento backdrop-blur-sm sm:p-8">
        <ProgressBento
          total={totalSentences}
          current={currentIndex}
          completed={currentIndex}
        />
        <p className="mt-4 text-sm font-semibold uppercase tracking-widest text-teal-accent">
          Sentence {currentIndex + 1} of {totalSentences}
        </p>
      </div>

      <div className="rounded-3xl bg-white/90 p-6 shadow-bento sm:p-10">
        <p className="mb-3 text-sm font-semibold text-ink/60">Spanish hint</p>
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

        <div
          role="status"
          aria-live="polite"
          className="mt-4 min-h-[1.5rem] text-sm font-semibold"
        >
          {feedback === "incorrect" && (
            <span className="text-gold-accent">Try another swatch!</span>
          )}
          {feedback === "correct" && (
            <span className="text-success-accent">Beautiful brushstroke!</span>
          )}
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
            onSelect={handleSelect}
          />
        ))}
      </motion.div>
    </section>
  );
}
