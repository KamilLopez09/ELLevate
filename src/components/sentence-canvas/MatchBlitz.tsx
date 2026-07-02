"use client";

import { useEffect, useState } from "react";
import { SentenceBuilder } from "@/components/sentence-canvas/SentenceBuilder";
import { SpeedTimer } from "@/components/sentence-canvas/SpeedTimer";
import { isDragMatchPrompt } from "@/lib/prompt-utils";
import { useCopy } from "@/lib/i18n/useCopy";
import type { GameModeProps } from "@/types/game-modes";

export function MatchBlitz({ prompts, onComplete }: GameModeProps) {
  const copy = useCopy();
  const dragPrompts = prompts.filter(isDragMatchPrompt);
  const promptId = dragPrompts[0]?.id ?? "";
  const [startedAt, setStartedAt] = useState(() => Date.now());

  useEffect(() => {
    setStartedAt(Date.now());
  }, [promptId]);

  if (dragPrompts.length === 0) {
    return (
      <p className="rounded-2xl bg-gold-accent/15 px-4 py-3 text-center text-sm text-ink/80">
        {copy.gameModes.noDragMatchPrompt}
      </p>
    );
  }

  return (
    <div className="flex w-full flex-col items-center">
      <SpeedTimer startedAt={startedAt} />
      <SentenceBuilder
        prompts={dragPrompts}
        gameModeId="match_blitz"
        onComplete={onComplete}
      />
    </div>
  );
}
