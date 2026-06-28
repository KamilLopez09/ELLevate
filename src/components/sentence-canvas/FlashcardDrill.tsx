"use client";

import { useEffect, useRef, useState } from "react";
import { calculateFlashcardScore } from "@/lib/gamification";
import {
  getFlashcardBack,
  getFlashcardFront,
} from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";

export function FlashcardDrill({ prompts, onComplete }: GameModeProps) {
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
    const scoreResult = calculateFlashcardScore({
      correct,
      firstTry: true,
      timeTakenMs: Date.now() - startTimeRef.current,
    });
    onComplete({ scoreResult, firstTry: true, correct });
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-teal-accent">
        Flashcard Drill · Review ✦
      </p>

      <button
        type="button"
        aria-label={revealed ? "Flashcard answer side" : "Flashcard question side"}
        onClick={() => setRevealed((value) => !value)}
        className="min-h-[200px] rounded-3xl bg-white p-8 text-center shadow-bento transition hover:brightness-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-accent"
      >
        <p className="text-2xl font-extrabold text-ink sm:text-3xl">
          {revealed ? getFlashcardBack(prompt) : getFlashcardFront(prompt)}
        </p>
        <p className="mt-4 text-sm font-semibold text-ink/50">
          {revealed ? "Tap to flip back" : "Tap to reveal answer"}
        </p>
      </button>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          aria-label="Mark flashcard as correct"
          onClick={() => finish(true)}
          className="min-h-[56px] flex-1 rounded-2xl bg-teal-accent px-4 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-accent"
        >
          Got it!
        </button>
        <button
          type="button"
          aria-label="Mark flashcard as missed"
          onClick={() => finish(false)}
          className="min-h-[56px] flex-1 rounded-2xl bg-gold-accent px-4 py-3 text-lg font-bold text-ink shadow-bento transition hover:brightness-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-accent"
        >
          Missed it
        </button>
      </div>
    </div>
  );
}
