const STEPS = ["Sign in", "Lesson", "Paint"] as const;

interface StepRailProps {
  current: 1 | 2 | 3;
}

/** Non-interactive indicator for the locked learning chain (Intake -> Lesson -> Application). */
export function StepRail({ current }: StepRailProps) {
  return (
    <ol
      className="flex flex-wrap items-center gap-x-2 gap-y-1"
      aria-label={`Step ${current} of ${STEPS.length}`}
    >
      {STEPS.map((label, index) => {
        const step = index + 1;
        const isActive = step === current;
        const isDone = step < current;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              aria-current={isActive ? "step" : undefined}
              className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-bold ${
                isActive
                  ? "bg-purple-accent text-white"
                  : isDone
                    ? "bg-teal-accent text-white"
                    : "bg-ink/10 text-ink/40"
              }`}
            >
              {step}
            </span>
            <span
              className={`text-sm font-semibold ${
                isActive ? "text-ink" : "text-ink/45"
              }`}
            >
              {label}
            </span>
            {step < STEPS.length && (
              <span aria-hidden className="mx-1 h-0.5 w-5 rounded bg-ink/15" />
            )}
          </li>
        );
      })}
    </ol>
  );
}
