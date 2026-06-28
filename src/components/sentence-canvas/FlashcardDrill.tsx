"use client";

import { useEffect, useRef, useState } from "react";
import { calculateScoreForMode } from "@/lib/gamification";
import {
  getFlashcardBack,
  getFlashcardFront,
} from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";

const TOUCH_TARGET = "min-h-[56px] min-w-[56px] px-6 py-3";

const CARD_SHADOW_FRONT =
  "shadow-[0_20px_50px_-16px_oklch(0.52_0.21_292/0.18),0_8px_24px_-8px_oklch(0.28_0.04_265/0.07)]";

const CARD_SHADOW_BACK =
  "shadow-[0_20px_50px_-16px_oklch(0.62_0.13_178/0.2),0_8px_24px_-8px_oklch(0.28_0.04_265/0.07)]";

const ACTION_BASE = [
  "inline-flex flex-1 items-center justify-center",
  TOUCH_TARGET,
  "rounded-2xl border-2 font-display font-bold text-h2",
  "transition-all duration-200 transition-decel",
  "active:translate-y-[6px] active:shadow-pushable-pressed",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
].join(" ");

const GOT_IT_CLASS = [
  ACTION_BASE,
  "bg-secondary border-secondary-dark text-card shadow-pushable-teal",
  "hover:brightness-[1.03]",
  "focus-visible:outline-secondary",
].join(" ");

const MISSED_IT_CLASS = [
  ACTION_BASE,
  "bg-highlight border-[oklch(0.58_0.14_75)] text-body",
  "shadow-[0_6px_0_0_oklch(0.58_0.14_75)]",
  "hover:brightness-[1.03]",
  "focus-visible:outline-highlight",
].join(" ");

function FlashcardFace({
  visible,
  label,
  hint,
}: {
  visible: boolean;
  label: string;
  hint: string;
}) {
  return (
    <div
      className={[
        "absolute inset-0 flex flex-col items-center justify-center gap-3",
        "transition-all duration-300 transition-decel",
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-2 scale-[0.98] opacity-0",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <p className="font-display text-h2 font-extrabold leading-tight text-body text-balance md:text-h1">
        {label}
      </p>
      <p className="text-body font-semibold text-muted">{hint}</p>
    </div>
  );
}

export function FlashcardDrill({
  prompts,
  gameModeId,
  onComplete,
}: GameModeProps) {
  const prompt = prompts[0] ?? null;
  const [revealed, setRevealed] = useState(false);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setRevealed(false);
  }, [prompt?.id]);

  if (!prompt) {
    return null;
  }

  const finish = (correct: boolean) => {
    const scoreResult = calculateScoreForMode(gameModeId, {
      correct,
      firstTry: true,
      timeTakenMs: Date.now() - startTimeRef.current,
    });
    onComplete({ scoreResult, firstTry: true, correct });
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-10 md:px-8 md:py-16">
      <button
        type="button"
        aria-label={revealed ? "Flashcard answer side" : "Flashcard question side"}
        aria-pressed={revealed}
        onClick={() => setRevealed((value) => !value)}
        className={[
          "w-full max-w-lg",
          "rounded-3xl bg-card px-8 py-12 text-center md:px-12 md:py-16",
          "transition-all duration-300 transition-decel",
          "hover:-translate-y-0.5",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary",
          revealed ? CARD_SHADOW_BACK : CARD_SHADOW_FRONT,
        ].join(" ")}
      >
        <div className="relative min-h-[7rem] md:min-h-[8rem]">
          <FlashcardFace
            visible={!revealed}
            label={getFlashcardFront(prompt)}
            hint="Tap to reveal answer"
          />
          <FlashcardFace
            visible={revealed}
            label={getFlashcardBack(prompt)}
            hint="Tap to flip back"
          />
        </div>
      </button>

      <div className="mt-14 flex w-full max-w-lg flex-col gap-4 sm:flex-row md:mt-16">
        <button
          type="button"
          aria-label="Mark flashcard as correct"
          onClick={() => finish(true)}
          className={GOT_IT_CLASS}
        >
          Got it!
        </button>
        <button
          type="button"
          aria-label="Mark flashcard as missed"
          onClick={() => finish(false)}
          className={MISSED_IT_CLASS}
        >
          Missed it
        </button>
      </div>
    </div>
  );
}
