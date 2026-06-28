"use client";

import "@/styles/animations.css";
import type { SessionScoreSummary } from "@/lib/gamification";

export interface ScoreboardProps {
  summary: SessionScoreSummary;
  sessionPoints: number;
  retryCount: number;
  onReturnToMenu: () => void;
  isSaving?: boolean;
}

export function Scoreboard({
  summary,
  sessionPoints,
  retryCount,
  onReturnToMenu,
  isSaving = false,
}: ScoreboardProps) {
  const accuracy =
    summary.totalPrompts > 0
      ? Math.round((summary.correctFirstTry / summary.totalPrompts) * 100)
      : 0;

  return (
    <section className="flex flex-col items-center rounded-3xl bg-paper p-8 text-center shadow-bento">
      <div className="animate-checkmark-pop mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-teal-accent/15">
        <svg viewBox="0 0 52 52" className="h-16 w-16" aria-hidden>
          <circle
            cx="26"
            cy="26"
            r="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-teal-accent/30"
          />
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14 27 l8 8 l16-18"
            className="animate-checkmark-draw text-teal-accent"
          />
        </svg>
      </div>

      <h2 className="text-3xl font-extrabold text-ink">Great work!</h2>
      <p className="mt-2 text-lg text-ink/70">
        You earned{" "}
        <span className="font-extrabold text-purple-accent">{sessionPoints}</span>{" "}
        points this round
        {retryCount > 0 ? " — nice persistence!" : ""}
      </p>

      <dl className="mt-8 grid w-full max-w-md gap-3 text-left">
        <div className="flex items-center justify-between rounded-2xl bg-camp-blue/40 px-4 py-3">
          <dt className="font-semibold text-ink/70">First-try bonuses</dt>
          <dd className="text-lg font-extrabold text-teal-accent">
            +{summary.totalFirstTryBonus}
          </dd>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-camp-blue/40 px-4 py-3">
          <dt className="font-semibold text-ink/70">Speed bonuses</dt>
          <dd className="text-lg font-extrabold text-gold-accent">
            +{summary.totalSpeedBonus}
          </dd>
        </div>
        <div className="flex items-center justify-between rounded-2xl bg-camp-blue/40 px-4 py-3">
          <dt className="font-semibold text-ink/70">Accuracy</dt>
          <dd className="text-lg font-extrabold text-ink">
            {summary.correctFirstTry}/{summary.totalPrompts} ({accuracy}%)
          </dd>
        </div>
      </dl>

      <button
        type="button"
        onClick={onReturnToMenu}
        disabled={isSaving}
        aria-label="Return to main menu"
        className="mt-8 min-h-[56px] rounded-3xl bg-purple-accent px-8 py-3 text-lg font-bold text-white shadow-bento transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-accent"
      >
        {isSaving ? "Saving…" : "Return to Main Menu"}
      </button>
    </section>
  );
}
