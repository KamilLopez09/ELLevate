/**
 * Camp-styled loading indicator. Renders a labeled status region so the
 * blank screen is replaced with friendly feedback. The spinner is paused by
 * the global prefers-reduced-motion rule.
 */
export function CampLoading({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center justify-center gap-4 text-center"
    >
      <span
        aria-hidden
        className="h-12 w-12 animate-spin rounded-full border-4 border-purple-accent/25 border-t-purple-accent"
      />
      <p className="font-display text-lg font-bold text-ink/70">{label}</p>
    </div>
  );
}
