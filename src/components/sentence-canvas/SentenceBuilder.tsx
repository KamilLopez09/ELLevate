"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  "min-h-[56px] min-w-[56px] px-6 py-3";

const OPTION_BASE = [
  "inline-flex items-center justify-center",
  TOUCH_TARGET,
  "rounded-2xl border-2 font-display font-bold text-h2",
  "bg-card text-body border-border",
  "transition-all duration-200 transition-decel",
  "active:translate-y-[6px] active:shadow-pushable-pressed",
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
  "rounded-2xl border-2 font-display font-bold text-h2",
  "bg-secondary border-secondary-dark text-card",
  "shadow-pushable-teal animate-spring",
  "pointer-events-none",
].join(" ");

function getOptionButtonClass(
  option: string,
  index: number,
  {
    filledAnswer,
    correctAnswer,
    isAdvancing,
    shakingOption,
  }: {
    filledAnswer: string | null;
    correctAnswer: string;
    isAdvancing: boolean;
    shakingOption: string | null;
  },
): string {
  if (isAdvancing && filledAnswer === correctAnswer && option === filledAnswer) {
    return OPTION_SUCCESS;
  }

  const accent = index % 2 === 0 ? OPTION_PRIMARY : OPTION_SECONDARY;
  const shake = shakingOption === option ? " animate-shake" : "";
  return `${accent}${shake}`;
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
      className={`mx-2 inline-flex min-h-[56px] min-w-[7rem] items-center justify-center rounded-2xl border-2 border-dashed align-middle transition-colors duration-200 transition-decel ${
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
  return (
    <div
      className="mt-14 flex w-full flex-wrap justify-center gap-4 md:mt-16 md:gap-5"
      role="group"
      aria-label="Answer choices"
    >
      {options.map((option, index) => (
        <button
          key={option}
          type="button"
          disabled={isAdvancing}
          aria-label={`Choose answer ${option}`}
          onClick={() => onSelect(option)}
          className={getOptionButtonClass(option, index, {
            filledAnswer,
            correctAnswer,
            isAdvancing,
            shakingOption,
          })}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function renderPromptContent(prompt: Prompt, filledAnswer: string | null) {
  const promptClass =
    "font-display text-h1 font-extrabold leading-[1.15] text-body text-balance";

  if (isDragMatchPrompt(prompt)) {
    return (
      <p className={promptClass}>{dragMatchQuestion(prompt)}</p>
    );
  }

  const clickParts = prompt.text.split("___");
  const displayValue = filledAnswer ?? "";

  return (
    <p className={promptClass} aria-live="polite">
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
  const [feedbackClass, setFeedbackClass] = useState("");
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [shakingOption, setShakingOption] = useState<string | null>(null);
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
    setFilledAnswer(null);
    setFeedbackClass("");
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
      setFeedbackClass("animate-spring");
      setIsAdvancing(true);

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
    [gameModeId, hasAttempted, isAdvancing, onComplete, prompt],
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
    setFeedbackClass("animate-shake");
    window.setTimeout(() => {
      setShakingOption(null);
      setFeedbackClass("");
    }, 400);
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
      <div className={`w-full text-center ${feedbackClass}`}>
        {renderPromptContent(prompt, filledAnswer)}
      </div>

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
