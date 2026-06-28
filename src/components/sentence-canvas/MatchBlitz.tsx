"use client";

import { useEffect, useRef } from "react";
import { createSwapy, type Swapy } from "swapy";
import type { ClickPaintPrompt, DragMatchPrompt } from "@/data/curriculum";
import { calculateScoreForMode } from "@/lib/gamification";
import {
  formatImageKey,
  imagePlaceholderClass,
  isClickPaintPrompt,
  isDragMatchPrompt,
} from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";

const TARGET_SLOT = "target-slot";

export function MatchBlitz({ prompts, gameModeId, onComplete }: GameModeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const swapyRef = useRef<Swapy | null>(null);
  const startTimeRef = useRef(Date.now());
  const hasAttemptedRef = useRef(false);
  const finishedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const dragPromptRef = useRef<DragMatchPrompt | null>(null);
  const clickPromptRef = useRef<ClickPaintPrompt | null>(null);

  onCompleteRef.current = onComplete;

  const dragPrompt = prompts.find(isDragMatchPrompt) ?? null;
  const clickPrompt = prompts.find(isClickPaintPrompt) ?? null;
  dragPromptRef.current = dragPrompt;
  clickPromptRef.current = clickPrompt;

  const promptId = dragPrompt?.id ?? clickPrompt?.id ?? "none";

  useEffect(() => {
    startTimeRef.current = Date.now();
    hasAttemptedRef.current = false;
    finishedRef.current = false;
  }, [promptId]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || (!dragPrompt && !clickPrompt)) {
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

      const droppedItem = slotItemMap.asObject[TARGET_SLOT];
      const activeDrag = dragPromptRef.current;
      const activeClick = clickPromptRef.current;

      let isCorrect = false;
      if (activeDrag) {
        isCorrect = droppedItem === activeDrag.target;
      } else if (activeClick) {
        const targets = Array.isArray(activeClick.target)
          ? activeClick.target
          : [activeClick.target];
        isCorrect = Boolean(droppedItem && targets.includes(droppedItem));
      }

      const firstTry = !hasAttemptedRef.current;

      if (!isCorrect) {
        hasAttemptedRef.current = true;
        swapy.update();
        return;
      }

      finishedRef.current = true;
      swapy.enable(false);

      const scoreResult = calculateScoreForMode(gameModeId, {
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
  }, [clickPrompt, dragPrompt, gameModeId, promptId]);

  if (!dragPrompt && !clickPrompt) {
    return null;
  }

  if (dragPrompt) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm font-semibold uppercase tracking-widest text-purple-accent">
          Match Blitz
        </p>

        <div
          ref={containerRef}
          className="grid gap-4 sm:grid-cols-2"
          aria-label={`Match the picture to ${dragPrompt.wordLabel}`}
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
                {dragPrompt.wordLabel}
              </span>
              <span className="text-sm font-semibold text-ink/50">
                Drop the match here
              </span>
            </div>
          </div>

          {dragPrompt.imageOptions.map((imageKey) => (
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

  const clickParts = clickPrompt!.text.split("___");

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-purple-accent">
        Match Blitz
      </p>

      <div
        ref={containerRef}
        className="grid gap-4 sm:grid-cols-2"
        aria-label="Drag the correct word into the sentence blank"
      >
        <div
          data-swapy-slot={TARGET_SLOT}
          className="col-span-full flex min-h-[120px] flex-col items-center justify-center rounded-3xl border-4 border-dashed border-purple-accent/40 bg-camp-blue/30 p-6 text-center"
        >
          <div
            data-swapy-item="blank-placeholder"
            className="swapy-item text-2xl font-bold text-ink sm:text-3xl"
          >
            {clickParts[0]}
            <span className="mx-2 inline-flex min-h-[56px] min-w-[5rem] items-center justify-center rounded-xl border-2 border-dashed border-teal-accent px-2 align-middle text-teal-accent">
              ___
            </span>
            {clickParts[1] ?? ""}
          </div>
        </div>

        {clickPrompt!.options.map((option) => (
          <div
            key={option}
            data-swapy-slot={option}
            className="flex min-h-[96px] items-stretch"
          >
            <div
              data-swapy-item={option}
              aria-label={`Drag word ${option}`}
              className="swapy-item flex min-h-[56px] flex-1 items-center justify-center rounded-2xl border-2 border-ink/10 bg-purple-accent/20 px-4 text-lg font-bold text-ink shadow-bento"
            >
              {option}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
