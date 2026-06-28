import type { Prompt } from "@/data/curriculum";

export interface TargetOccurrence {
  word: string;
  start: number;
  end: number;
}

export interface ParsedPromptSegment {
  before: string;
  target: string;
  after: string;
}

/** Normalises Prompt.target to an ordered list of strings. */
export function normalizeTargets(target: Prompt["target"]): string[] {
  return Array.isArray(target) ? target : [target];
}

/** Stable option id derived from prompt id + option label. */
export function optionIdFor(promptId: string, label: string): string {
  const slug = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${promptId}__${slug || "opt"}`;
}

/**
 * Finds every target string in `text`, left-to-right, using the first unused
 * match for each target entry (supports repeated words like "needs").
 */
export function findTargetOccurrences(
  text: string,
  targets: string[],
): TargetOccurrence[] {
  const occurrences: TargetOccurrence[] = [];
  let searchFrom = 0;

  for (const target of targets) {
    const idx = text.indexOf(target, searchFrom);
    if (idx === -1) {
      const lowerText = text.toLowerCase();
      const lowerTarget = target.toLowerCase();
      const idxLower = lowerText.indexOf(lowerTarget, searchFrom);
      if (idxLower === -1) {
        continue;
      }
      occurrences.push({
        word: text.slice(idxLower, idxLower + target.length),
        start: idxLower,
        end: idxLower + target.length,
      });
      searchFrom = idxLower + target.length;
      continue;
    }
    occurrences.push({ word: target, start: idx, end: idx + target.length });
    searchFrom = idx + target.length;
  }

  return occurrences.sort((a, b) => a.start - b.start);
}

/** Splits `text` around the active target occurrence (for blank rendering). */
export function parsePromptSegment(
  text: string,
  targets: string[],
  blankIndex = 0,
): ParsedPromptSegment {
  const occurrences = findTargetOccurrences(text, targets);
  const active = occurrences[blankIndex];

  if (!active) {
    return { before: text, target: targets[0] ?? "", after: "" };
  }

  return {
    before: text.slice(0, active.start),
    target: active.word,
    after: text.slice(active.end),
  };
}

/** Whether the selected label matches the active blank's expected target. */
export function isCorrectSelection(
  selectedLabel: string,
  expectedTarget: string,
): boolean {
  return selectedLabel === expectedTarget;
}
