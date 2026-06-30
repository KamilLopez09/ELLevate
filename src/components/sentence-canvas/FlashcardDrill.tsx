"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { calculateScoreForMode } from "@/lib/gamification";
import {
  getFlashcardBack,
  getFlashcardFront,
} from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";

const TOUCH_TARGET = "min-h-[64px] min-w-[64px] px-6 py-3";

const CARD_SHADOW_FRONT =
  "shadow-[0_20px_50px_-16px_rgba(26,95,168,0.18),0_8px_24px_-8px_rgba(26,39,68,0.07)]";

const CARD_SHADOW_BACK =
  "shadow-[0_20px_50px_-16px_rgba(26,143,122,0.2),0_8px_24px_-8px_rgba(26,39,68,0.07)]";

const HOVER_SPRING = { type: "spring" as const, bounce: 0.4, duration: 0.35 };

const ACTION_BASE = [
  "inline-flex flex-1 items-center justify-center",
  TOUCH_TARGET,
  "rounded-2xl border-2 font-display font-bold",
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
  "bg-highlight border-[#d49200] text-body",
  "shadow-[0_6px_0_0_#d49200]",
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
    <motion.div
      initial={false}
      animate={{
        opacity: visible ? 1 : 0,
        y: visible ? 0 : 8,
        scale: visible ? 1 : 0.98,
      }}
      transition={HOVER_SPRING}
      className={[
        "absolute inset-0 flex flex-col items-center justify-center gap-3",
        visible ? "pointer-events-auto" : "pointer-events-none",
      ].join(" ")}
      aria-hidden={!visible}
    >
      <p
        className="font-display font-extrabold leading-tight text-body text-balance"
        style={{ fontSize: "var(--text-h1)" }}
      >
        {label}
      </p>
      <p className="font-semibold text-muted-foreground" style={{ fontSize: "var(--text-body)" }}>
        {hint}
      </p>
    </motion.div>
  );
}

function ActionButton({
  label,
  className,
  onClick,
  burstOnClick,
}: {
  label: string;
  className: string;
  onClick: () => void;
  burstOnClick?: boolean;
}) {
  const controls = useAnimation();

  const handleClick = () => {
    if (burstOnClick) {
      void controls.start({
        scale: [1, 1.12, 0.96, 1.04, 1],
        transition: { type: "spring", bounce: 0.5, duration: 0.55 },
      });
    }
    onClick();
  };

  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={handleClick}
      animate={controls}
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      transition={HOVER_SPRING}
      className={className}
      style={{ fontSize: "var(--text-h2)" }}
    >
      {label}
    </motion.button>
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
      <motion.button
        type="button"
        aria-label={revealed ? "Flashcard answer side" : "Flashcard question side"}
        aria-pressed={revealed}
        onClick={() => setRevealed((value) => !value)}
        whileHover={{ scale: 1.03, rotate: -0.5 }}
        whileTap={{ scale: 0.97 }}
        transition={HOVER_SPRING}
        className={[
          "w-full max-w-lg min-h-[64px]",
          "rounded-3xl bg-card px-8 py-12 text-center md:px-12 md:py-16",
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
      </motion.button>

      <div className="mt-14 flex w-full max-w-lg flex-col gap-4 sm:flex-row md:mt-16">
        <ActionButton
          label="Got it!"
          className={GOT_IT_CLASS}
          burstOnClick
          onClick={() => finish(true)}
        />
        <ActionButton
          label="Missed it"
          className={MISSED_IT_CLASS}
          onClick={() => finish(false)}
        />
      </div>
    </div>
  );
}
