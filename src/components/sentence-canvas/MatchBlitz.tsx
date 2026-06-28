"use client";

import { useEffect, useRef } from "react";
import { createSwapy, type Swapy } from "swapy";
import type { DragMatchPrompt } from "@/data/curriculum";
import { calculateMatchBlitzScore } from "@/lib/gamification";
import {
  formatImageKey,
  imagePlaceholderClass,
  isDragMatchPrompt,
} from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";

const TARGET_SLOT = "target-slot";

export function MatchBlitz({ prompts, onComplete }: GameModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<Swapy | null>(null);
  const startTimeRef = useRef(Date.now());
  const hasAttemptedRef = useRef(false);
  const finishedRef = useRef(false);
  const promptRef = useRef<DragMatchPrompt | null>(null);

  const prompt = prompts.find(isDragMatchPrompt) ?? null;
  promptRef.current = prompt;

  useEffect(() => {
    startTimeRef.current = Date.now();
    hasAttemptedRef.current = false;
    finishedRef.current = false;
  }, [prompt?.id]);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !prompt) {
      return;
    }

    const swapy = createSwapy(container, {
      animation: "dynamic",
      swapMode: "drop",
      dragAxis: "both",
    });
    swapyRef.current = swapy;

    swapy.onSwapEnd(({ slotItemMap, hasChanged }) => {
      if (!hasChanged || finishedRef.current) {
        return;
      }

      const activePrompt = promptRef.current;
      if (!activePrompt) {
        return;
      }

      const droppedItem = slotItemMap.asObject[TARGET_SLOT];
      const isCorrect = droppedItem === activePrompt.target;
      const firstTry = !hasAttemptedRef.current;

      if (!isCorrect) {
        hasAttemptedRef.current = true;
        swapy.update();
        return;
      }

      finishedRef.current = true;
      swapy.enable(false);

      const scoreResult = calculateMatchBlitzScore({
        correct: true,
        firstTry,
        timeTakenMs: Date.now() - startTimeRef.current,
      });

      onCompleteRef.current({ scoreResult, firstTry, correct: true });
    });

    return () => {
      swapy.destroy();
      swapyRef.current = null;
    };
  }, [prompt]);

  if (!prompt) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-purple-accent">
        Match Blitz
      </p>

      <div
        ref={containerRef}
        className="grid gap-4 sm:grid-cols-2"
        aria-label={`Match the picture to ${prompt.wordLabel}`}
      >
        <div
          data-swapy-slot={TARGET_SLOT}
          className="col-span-full flex min-h-[120px] items-center justify-center rounded-3xl border-4 border-dashed border-purple-accent/40 bg-camp-blue/30 p-6"
        >
          <div
            data-swapy-item="target-placeholder"
            className="swapy-item flex flex-col items-center gap-2"
          >
            <span className="text-3xl font-extrabold text-ink sm:text-4xl">
              {prompt.wordLabel}
            </span>
            <span className="text-sm font-semibold text-ink/50">
              Drop the match here
            </span>
          </div>
        </div>

        {prompt.imageOptions.map((imageKey) => (
          <div
            key={imageKey}
            data-swapy-slot={imageKey}
            className="flex min-h-[96px] items-stretch"
          >
            <div
              data-swapy-item={imageKey}
              aria-label={`Drag picture ${formatImageKey(imageKey)}`}
              className={`swapy-item min-h-[56px] flex-1 rounded-2xl border-2 border-ink/10 shadow-bento ${imagePlaceholderClass(imageKey)}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
