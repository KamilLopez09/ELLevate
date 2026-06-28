import type {
  ClickPaintPrompt,
  DragMatchPrompt,
  Prompt,
} from "@/data/curriculum";
import type { GameModeId } from "@/lib/gamification";

export function isDragMatchPrompt(prompt: Prompt): prompt is DragMatchPrompt {
  return prompt.mode === "drag-match";
}

export function isClickPaintPrompt(prompt: Prompt): prompt is ClickPaintPrompt {
  return prompt.mode === "click-paint";
}

export function getPromptAnswer(prompt: Prompt): string {
  if (isDragMatchPrompt(prompt)) {
    return prompt.target;
  }
  return Array.isArray(prompt.target) ? prompt.target[0] : prompt.target;
}

export function getFlashcardFront(prompt: Prompt): string {
  if (isDragMatchPrompt(prompt)) {
    return prompt.wordLabel;
  }
  return prompt.text.replace("___", "___");
}

export function getFlashcardBack(prompt: Prompt): string {
  if (isDragMatchPrompt(prompt)) {
    return formatImageKey(prompt.target);
  }
  return getPromptAnswer(prompt);
}

export function formatImageKey(key: string): string {
  return key.replace(/^img_/, "").replace(/_/g, " ");
}

export function imagePlaceholderClass(key: string): string {
  const palettes = [
    "bg-purple-accent/30",
    "bg-teal-accent/30",
    "bg-gold-accent/40",
  ];
  const index =
    key.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0) %
    palettes.length;
  return palettes[index];
}

export function dragMatchToChoices(prompt: DragMatchPrompt): string[] {
  return prompt.imageOptions.map(formatImageKey);
}

export function dragMatchAnswer(prompt: DragMatchPrompt): string {
  return formatImageKey(prompt.target);
}

export function dragMatchQuestion(prompt: DragMatchPrompt): string {
  return `Which picture matches "${prompt.wordLabel}"?`;
}

/** Suggested default mode by prompt category (user may override via selector). */
export function suggestGameMode(prompt: Prompt): GameModeId {
  if (prompt.category === "review") {
    return "flashcard_drill";
  }
  if (isDragMatchPrompt(prompt)) {
    return "match_blitz";
  }
  if (prompt.category === "generative") {
    return "sentence_builder";
  }
  return "rapid_fire";
}

export function isAnswerCorrect(prompt: Prompt, answer: string): boolean {
  if (isDragMatchPrompt(prompt)) {
    return answer === prompt.target;
  }
  const targets = Array.isArray(prompt.target)
    ? prompt.target
    : [prompt.target];
  return targets.includes(answer);
}
