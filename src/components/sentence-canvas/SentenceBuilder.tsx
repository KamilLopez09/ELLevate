"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import { calculateScoreForMode } from "@/lib/gamification";
import {
  dragMatchAnswer,
  dragMatchQuestion,
  dragMatchToChoices,
  getPromptAnswer,
  isAnswerCorrect,
  isClickPaintPrompt,
  isDragMatchPrompt,
} from "@/lib/prompt-utils";
import type { GameModeProps } from "@/types/game-modes";
import type { Prompt } from "@/data/curriculum";

const TOUCH_TARGET =
  "min-h-[64px] min-w-[64px] px-6 py-3";

const OPTION_BASE = [
  "inline-flex items-center justify-center",
  TOUCH_TARGET,
  "rounded-2xl border-2 font-display font-bold",
  "bg-card text-body border-border",
  "cursor-pointer select-none",
  "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
  "disabled:cursor-not-allowed disabled:opacity-60",
].join(" ");

const OPTION_PRIMARY = [
  OPTION_BASE,
  "shadow-pushable-purple hover:border-primary hover:text-primary",
  "focus-visible:outline-primary",
].join(" ");

const OPTION_SECONDARY = [
  OPTION_BASE,
  "shadow-pushable-teal hover:border-secondary hover:text-secondary",
  "focus-visible:outline-secondary",
].join(" ");

const OPTION_SUCCESS = [
  "inline-flex items-center justify-center",
  TOUCH_TARGET,
  "rounded-2xl border-2 font-display font-bold",
  "bg-secondary border-secondary-dark text-card",
  "shadow-pushable-teal",
  "pointer-events-none",
].join(" ");

const HOVER_SPRING = { type: "spring" as const, bounce: 0.4, duration: 0.35 };

function getOptionButtonClass(
  option: string,
  index: number,
  {
    filledAnswer,
    correctAnswer,
    isAdvancing,
  }: {
    filledAnswer: string | null;
    correctAnswer: string;
    isAdvancing: boolean;
  },
): string {
  if (isAdvancing && filledAnswer === correctAnswer && option === filledAnswer) {
    return OPTION_SUCCESS;
  }

  return index % 2 === 0 ? OPTION_PRIMARY : OPTION_SECONDARY;
}

function TargetBlank({
  filledAnswer,
  displayValue,
}: {
  filledAnswer: string | null;
  displayValue: string;
}) {
  const filled = Boolean(filledAnswer);

  return (
    <span
      className={`mx-2 inline-flex min-h-[64px] min-w-[7rem] items-center justify-center rounded-2xl border-2 border-dashed align-middle transition-colors duration-200 transition-decel ${
        filled
          ? "border-primary bg-primary/10 font-extrabold text-primary"
          : "border-border bg-surface-muted text-muted"
      }`}
      aria-label={filled ? `Selected answer: ${displayValue}` : "Blank to fill in"}
    >
      {filled ? displayValue : "___"}
    </span>
  );
}

function OptionButton({
  option,
  index,
  filledAnswer,
  correctAnswer,
  isAdvancing,
  onSelect,
}: {
  option: string;
  index: number;
  filledAnswer: string | null;
  correctAnswer: string;
  isAdvancing: boolean;
  onSelect: (option: string) => void;
}) {
  const controls = useAnimation();
  const isSuccess =
    isAdvancing && filledAnswer === correctAnswer && option === filledAnswer;

  const handleClick = async () => {
    if (isAdvancing) return;
    onSelect(option);
  };

  useEffect(() => {
    if (!isSuccess) return;
    void controls.start({
      scale: [1, 1.18, 0.96, 1.04, 1],
      transition: { type: "spring", bounce: 0.5, duration: 0.55 },
    });
  }, [controls, isSuccess]);

  if (isSuccess) {
    return (
      <motion.span
        animate={controls}
        className={getOptionButtonClass(option, index, {
          filledAnswer,
          correctAnswer,
          isAdvancing,
        })}
        style={{ fontSize: "var(--text-h2)" }}
      >
        {option}
      </motion.span>
    );
  }

  return (
    <motion.button
      type="button"
      disabled={isAdvancing}
      aria-label={`Choose answer ${option}`}
      onClick={() => void handleClick()}
      animate={controls}
      whileHover={{ scale: 1.05, rotate: 1 }}
      whileTap={{ scale: 0.95 }}
      transition={HOVER_SPRING}
      className={getOptionButtonClass(option, index, {
        filledAnswer,
        correctAnswer,
        isAdvancing,
      })}
      style={{ fontSize: "var(--text-h2)" }}
    >
      {option}
    </motion.button>
  );
}

function OptionButtons({
  options,
  filledAnswer,
  correctAnswer,
  isAdvancing,
  shakingOption,
  onSelect,
}: {
  options: string[];
  filledAnswer: string | null;
  correctAnswer: string;
  isAdvancing: boolean;
  shakingOption: string | null;
  onSelect: (option: string) => void;
}) {
  const shakeControls = useAnimation();

  useEffect(() => {
    if (!shakingOption) return;
    void shakeControls.start({
      x: [0, -10, 10, -8, 8, -4, 4, 0],
      transition: { duration: 0.45, ease: "easeInOut" },
    });
  }, [shakeControls, shakingOption]);

  return (
    <motion.div
      className="mt-14 flex w-full flex-wrap justify-center gap-4 md:mt-16 md:gap-5"
      role="group"
      aria-label="Answer choices"
    >
      {options.map((option, index) => (
        <motion.div
          key={option}
          animate={shakingOption === option ? shakeControls : undefined}
          className="inline-flex"
        >
          <OptionButton
            option={option}
            index={index}
            filledAnswer={filledAnswer}
            correctAnswer={correctAnswer}
            isAdvancing={isAdvancing}
            onSelect={onSelect}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

function renderPromptContent(prompt: Prompt, filledAnswer: string | null) {
  const promptClass =
    "font-display font-extrabold leading-[1.15] text-body text-balance";

  if (isDragMatchPrompt(prompt)) {
    return (
      <p className={promptClass} style={{ fontSize: "var(--text-h1)" }}>
        {dragMatchQuestion(prompt)}
      </p>
    );
  }

  const clickParts = prompt.text.split("___");
  const displayValue = filledAnswer ?? "";

  return (
    <p
      className={promptClass}
      style={{ fontSize: "var(--text-h1)" }}
      aria-live="polite"
    >
      {clickParts[0]}
      <TargetBlank filledAnswer={filledAnswer} displayValue={displayValue} />
      {clickParts[1] ?? ""}
    </p>
  );
}

function getOptionsForPrompt(prompt: Prompt): string[] {
  if (isDragMatchPrompt(prompt)) {
    return dragMatchToChoices(prompt);
  }
  return [...prompt.options];
}

function normalizeSelection(prompt: Prompt, option: string): string {
  if (isDragMatchPrompt(prompt)) {
    return option === dragMatchAnswer(prompt) ? prompt.target : option;
  }
  return option;
}

function displayFilledAnswer(prompt: Prompt, answer: string): string {
  if (isDragMatchPrompt(prompt)) {
    return dragMatchAnswer(prompt);
  }
  return answer;
}

export function SentenceBuilder({
  prompts,
  gameModeId,
  onComplete,
}: GameModeProps) {
  const dragPrompt = prompts.find(isDragMatchPrompt) ?? null;
  const clickPrompt = prompts.find(isClickPaintPrompt) ?? null;
  const prompt = dragPrompt ?? clickPrompt;

  const [filledAnswer, setFilledAnswer] = useState<string | null>(null);
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const promptControls = useAnimation();
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setFilledAnswer(null);
    setHasAttempted(false);
    setIsAdvancing(false);
    setShakingOption(null);
  }, [prompt?.id]);

  const finishCorrect = useCallback(
    (answer: string, displayAnswer: string) => {
      if (!prompt || isAdvancing) {
        return;
      }

      setFilledAnswer(displayAnswer);
      setIsAdvancing(true);

      void promptControls.start({
        scale: [1, 1.08, 0.98, 1.02, 1],
        transition: { type: "spring", bounce: 0.45, duration: 0.6 },
      });

      const firstTry = !hasAttempted;
      const scoreResult = calculateScoreForMode(gameModeId, {
        correct: true,
        firstTry,
        timeTakenMs: Date.now() - startTimeRef.current,
      });

      window.setTimeout(() => {
        onComplete({ scoreResult, firstTry, correct: true });
      }, 600);
    },
    [gameModeId, hasAttempted, isAdvancing, onComplete, prompt, promptControls],
  );

  const handleSelect = (option: string) => {
    if (!prompt || isAdvancing) {
      return;
    }

    const normalized = normalizeSelection(prompt, option);

    if (isAnswerCorrect(prompt, normalized)) {
      finishCorrect(normalized, displayFilledAnswer(prompt, option));
      return;
    }

    setHasAttempted(true);
    setShakingOption(option);
    window.setTimeout(() => {
      setShakingOption(null);
    }, 450);
  };

  if (!prompt) {
    return null;
  }

  const options = getOptionsForPrompt(prompt);
  const correctDisplay = isDragMatchPrompt(prompt)
    ? dragMatchAnswer(prompt)
    : getPromptAnswer(prompt);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 py-10 md:px-8 md:py-16">
      <motion.div
        animate={promptControls}
        className="w-full text-center"
      >
        {renderPromptContent(prompt, filledAnswer)}
      </motion.div>

      <OptionButtons
        options={options}
        filledAnswer={filledAnswer}
        correctAnswer={correctDisplay}
        isAdvancing={isAdvancing}
        shakingOption={shakingOption}
        onSelect={handleSelect}
      />
    </div>
  );
}
