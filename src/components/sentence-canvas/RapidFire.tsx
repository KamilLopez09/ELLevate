"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import "@/styles/animations.css";
import { calculateScoreForMode } from "@/lib/gamification";
import {
  dragMatchAnswer,
  dragMatchQuestion,
  dragMatchToChoices,
  isAnswerCorrect,
  isClickPaintPrompt,
  isDragMatchPrompt,
} from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";

const RAPID_FIRE_LIMIT_MS = 10000;
const TICK_MS = 100;

export function RapidFire({ prompts, gameModeId, onComplete }: GameModeProps) {
  const dragPrompt = prompts.find(isDragMatchPrompt) ?? null;
  const clickPrompt = prompts.find(isClickPaintPrompt) ?? null;
  const prompt = dragPrompt ?? clickPrompt;

  const [remainingMs, setRemainingMs] = useState(RAPID_FIRE_LIMIT_MS);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [feedbackClass, setFeedbackClass] = useState("");
  const [isAdvancing, setIsAdvancing] = useState(false);
  const startTimeRef = useRef(Date.now());
  const finishedRef = useRef(false);

  const finish = useCallback(
    (correct: boolean, firstTry: boolean) => {
      if (finishedRef.current || !prompt) {
        return;
      }
      finishedRef.current = true;
      setIsAdvancing(true);

      const scoreResult = calculateScoreForMode(gameModeId, {
        correct,
        firstTry,
        timeTakenMs: Date.now() - startTimeRef.current,
      });

      onComplete({ scoreResult, firstTry, correct });
    },
    [gameModeId, onComplete, prompt],
  );

  useEffect(() => {
    startTimeRef.current = Date.now();
    finishedRef.current = false;
    setRemainingMs(RAPID_FIRE_LIMIT_MS);
    setHasAttempted(false);
    setFeedbackClass("");
    setIsAdvancing(false);
  }, [prompt?.id]);

  useEffect(() => {
    if (!prompt || isAdvancing) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const nextRemaining = Math.max(RAPID_FIRE_LIMIT_MS - elapsed, 0);
      setRemainingMs(nextRemaining);

      if (nextRemaining === 0 && !finishedRef.current) {
        finish(false, !hasAttempted);
      }
    }, TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [finish, hasAttempted, isAdvancing, prompt]);

  const handleSelect = (option: string) => {
    if (!prompt || isAdvancing || finishedRef.current) {
      return;
    }

    if (isAnswerCorrect(prompt, option)) {
      setFeedbackClass("animate-spring");
      finish(true, !hasAttempted);
      return;
    }

    setHasAttempted(true);
    setFeedbackClass("animate-shake");
    window.setTimeout(() => setFeedbackClass(""), 400);
  };

  if (!prompt) {
    return null;
  }

  const secondsLeft = (remainingMs / 1000).toFixed(1);
  const urgency =
    remainingMs <= 3000 ? "text-red-500" : "text-teal-accent";

  const questionText = dragPrompt
    ? dragMatchQuestion(dragPrompt)
    : clickPrompt!.text.replace("___", " ___ ");

  const options = dragPrompt
    ? dragMatchToChoices(dragPrompt)
    : clickPrompt!.options;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-semibold uppercase tracking-widest text-gold-accent">
          Rapid Fire
        </p>
        <p
          className={`text-lg font-extrabold tabular-nums ${urgency}`}
          aria-live="polite"
        >
          {secondsLeft}s
        </p>
      </div>

      <p
        className={`text-2xl font-bold leading-relaxed text-ink sm:text-3xl ${feedbackClass}`}
      >
        {questionText}
      </p>

      <div className="flex flex-col gap-3 sm:flex-row">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            disabled={isAdvancing}
            aria-label={`Rapid fire answer ${option}`}
            onClick={() =>
              handleSelect(
                dragPrompt
                  ? option === dragMatchAnswer(dragPrompt)
                    ? dragPrompt.target
                    : option
                  : option,
              )
            }
            className="min-h-[56px] flex-1 rounded-2xl bg-gold-accent px-4 py-3 text-lg font-bold text-ink shadow-bento transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-accent"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
