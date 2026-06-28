"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/animations.css";
import { calculateSentenceBuilderScore } from "@/lib/gamification";
import { isAnswerCorrect, isClickPaintPrompt } from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";

export function SentenceBuilder({ prompts, onComplete }: GameModeProps) {
  const prompt = prompts.find(isClickPaintPrompt) ?? null;
  const [filledAnswer, setFilledAnswer] = useState<string | null>(null);
  const [feedbackClass, setFeedbackClass] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setFilledAnswer(null);
    setFeedbackClass("");
    setHasAttempted(false);
    setIsAdvancing(false);
  }, [prompt?.id]);

  const finishCorrect = useCallback(
    (answer: string) => {
      if (!prompt || isAdvancing) {
        return;
      }

      setFilledAnswer(answer);
      setFeedbackClass("animate-spring");
      setIsAdvancing(true);

      const firstTry = !hasAttempted;
      const scoreResult = calculateSentenceBuilderScore({
        correct: true,
        firstTry,
        timeTakenMs: Date.now() - startTimeRef.current,
      });

      window.setTimeout(() => {
        onComplete({ scoreResult, firstTry, correct: true });
      }, 600);
    },
    [hasAttempted, isAdvancing, onComplete, prompt],
  );

  const handleSelect = (option: string) => {
    if (!prompt || isAdvancing) {
      return;
    }

    if (isAnswerCorrect(prompt, option)) {
      finishCorrect(option);
      return;
    }

    setHasAttempted(true);
    setFeedbackClass("animate-shake");
    window.setTimeout(() => setFeedbackClass(""), 400);
  };

  if (!prompt) {
    return null;
  }

  const clickParts = prompt.text.split("___");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-purple-accent">
        Sentence Builder
      </p>

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

      <div className="flex flex-col gap-3 sm:flex-row">
        {prompt.options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={isAdvancing}
            aria-label={`Choose answer ${option}`}
            onClick={() => handleSelect(option)}
            className="min-h-[56px] flex-1 rounded-2xl bg-purple-accent px-4 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
