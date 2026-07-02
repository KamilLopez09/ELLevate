"use client";

import { useEffect, useState } from "react";
import { useCopy } from "@/lib/i18n/useCopy";

const SPEED_BONUS_FLOOR_MS = 3000;
const SPEED_BONUS_CEILING_MS = 10000;

export function SpeedTimer({ startedAt }: { startedAt: number }) {
  const copy = useCopy();
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    const tick = () => setElapsedMs(Date.now() - startedAt);
    tick();
    const interval = window.setInterval(tick, 100);
    return () => window.clearInterval(interval);
  }, [startedAt]);

  const progress = Math.min(1, elapsedMs / SPEED_BONUS_CEILING_MS);
  const inBonusZone = elapsedMs < SPEED_BONUS_FLOOR_MS;

  return (
    <div
      className="mb-6 w-full max-w-lg"
      role="status"
      aria-live="polite"
      aria-label={copy.gameModes.speedTimerAria(elapsedMs)}
    >
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-ink/50">
        <span>{copy.gameModes.speedTimerLabel}</span>
        <span className="tabular-nums">{(elapsedMs / 1000).toFixed(1)}s</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-camp-blue/50">
        <div
          className={[
            "h-full rounded-full transition-all duration-100",
            inBonusZone ? "bg-gold-accent" : "bg-teal-accent",
          ].join(" ")}
          style={{ width: `${Math.max(4, progress * 100)}%` }}
        />
      </div>
      <p className="mt-2 text-center text-sm text-ink/60">
        {inBonusZone
          ? copy.gameModes.speedTimerHot
          : copy.gameModes.speedTimerWarm}
      </p>
    </div>
  );
}
