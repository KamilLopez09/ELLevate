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

const OPTION_DEFAULT =
  "bg-white border-4 border-camp-gray-dark text-camp-slate font-bold text-2xl rounded-2xl px-8 py-4 min-h-[72px] min-w-[140px] shadow-pushable-gray transition-all active:translate-y-[6px] active:shadow-pushable-pressed cursor-pointer select-none hover:border-camp-purple hover:text-camp-purple focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-camp-purple disabled:cursor-not-allowed";

const OPTION_SUCCESS =
  "bg-camp-teal border-4 border-camp-teal-dark text-white shadow-pushable-teal animate-spring pointer-events-none min-h-[72px] min-w-[140px] rounded-2xl px-8 py-4 font-bold text-2xl";

function getOptionButtonClass(
  option: string,
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

  const shake = shakingOption === option ? " animate-shake" : "";
  return `${OPTION_DEFAULT}${shake}`;
}

function BentoPromptCard({
  children,
  feedbackClass,
}: {
  children: React.ReactNode;
  feedbackClass: string;
}) {
  return (
    <div
      className={`bg-camp-card rounded-[2rem] border-4 border-white p-8 text-center shadow-bento-card md:p-12 ${feedbackClass}`}
    >
      {children}
    </div>
  );
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
      className={`mx-3 inline-flex h-[60px] min-w-[140px] items-center justify-center rounded-2xl border-4 border-dashed align-middle transition-colors ${
        filled
          ? "border-camp-purple bg-camp-purple/10 font-extrabold text-camp-purple"
          : "border-camp-gray-dark bg-gray-50 text-camp-gray-dark"
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
    <div className="mt-8 flex flex-wrap justify-center gap-6">
      {options.map((option) => (
        <button
          key={option}
          type="button"
          disabled={isAdvancing}
          aria-label={`Choose answer ${option}`}
          onClick={() => onSelect(option)}
          className={getOptionButtonClass(option, {
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
  if (isDragMatchPrompt(prompt)) {
    return (
      <p className="text-3xl font-extrabold leading-tight text-camp-slate md:text-5xl">
        {dragMatchQuestion(prompt)}
      </p>
    );
  }

  const clickParts = prompt.text.split("___");
  const displayValue = filledAnswer ?? "";

  return (
    <p
      className="text-3xl font-extrabold leading-tight text-camp-slate md:text-5xl"
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
    <div className="mx-auto max-w-3xl space-y-8 p-4 md:p-8">
      <p className="text-center text-sm font-semibold uppercase tracking-widest text-camp-purple">
        Sentence Builder
      </p>

      <BentoPromptCard feedbackClass={feedbackClass}>
        {renderPromptContent(prompt, filledAnswer)}
      </BentoPromptCard>

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
