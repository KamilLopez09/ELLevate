"use client";

import { useRouter } from "next/navigation";
import type { LessonProgressOutcome } from "@/types/lesson-progress";

export interface PracticeProgressHeaderProps {
  promptIndex: number;
  outcomes: LessonProgressOutcome[];
  totalSteps?: number;
  exitHref?: string;
  exitLabel?: string;
}

function ProgressPill({
  outcome,
  isActive,
  stepNumber,
}: {
  outcome: LessonProgressOutcome;
  isActive: boolean;
  stepNumber: number;
}) {
  let className =
    "h-2.5 w-6 shrink-0 rounded-full bg-surface-muted transition-all duration-300 transition-decel sm:w-7";

  if (outcome === "correct") {
    className =
      "h-2.5 w-6 shrink-0 rounded-full bg-secondary transition-all duration-300 transition-decel sm:w-7";
  } else if (outcome === "incorrect") {
    className =
      "h-2.5 w-6 shrink-0 rounded-full bg-primary/30 ring-1 ring-primary/40 transition-all duration-300 transition-decel sm:w-7";
  } else if (isActive) {
    className =
      "h-3 w-7 shrink-0 rounded-full border-2 border-primary bg-card progress-pulse sm:w-8";
  }

  return (
    <li
      className={className}
      aria-current={isActive ? "step" : undefined}
      aria-label={`Question ${stepNumber}${
        outcome === "correct"
          ? ", completed correctly"
          : outcome === "incorrect"
            ? ", completed with retry"
            : isActive
              ? ", current"
              : ", not started"
      }`}
    />
  );
}

export function PracticeProgressHeader({
  promptIndex,
  outcomes,
  totalSteps = 10,
  exitHref = "/menu",
  exitLabel = "Leave Paint Mode",
}: PracticeProgressHeaderProps) {
  const router = useRouter();
  const completedCount = outcomes.filter((outcome) => outcome !== "pending").length;

  return (
    <header className="mb-8 flex items-center gap-3 sm:gap-4">
      <button
        type="button"
        onClick={() => router.push(exitHref)}
        aria-label={exitLabel}
        className={[
          "inline-flex shrink-0 items-center justify-center gap-2",
          "min-h-[56px] min-w-[56px] rounded-2xl border-2 border-border bg-card",
          "px-4 font-display text-sm font-bold text-body",
          "transition-all duration-200 transition-decel",
          "hover:border-primary hover:text-primary",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        ].join(" ")}
      >
        <span aria-hidden className="text-xl leading-none">
          ×
        </span>
        <span className="hidden sm:inline">{exitLabel}</span>
      </button>

      <ol
        role="progressbar"
        aria-valuenow={Math.min(completedCount, totalSteps)}
        aria-valuemin={0}
        aria-valuemax={totalSteps}
        aria-label="Practice progress"
        className="ml-auto flex flex-1 items-center justify-end gap-1.5 sm:gap-2"
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <ProgressPill
            key={index}
            stepNumber={index + 1}
            outcome={outcomes[index] ?? "pending"}
            isActive={index === promptIndex && promptIndex < totalSteps}
          />
        ))}
      </ol>
    </header>
  );
}
