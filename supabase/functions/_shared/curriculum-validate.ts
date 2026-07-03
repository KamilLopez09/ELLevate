/** Shared curriculum validation for Edge Functions (mirrors src/lib/curriculum-validate.ts). */

const AGE_GROUPS = ["5-9", "10-14"] as const;

const EXPECTED_CATEGORIES = [
  "review",
  "review",
  "review",
  "core",
  "core",
  "core",
  "core",
  "generative",
  "generative",
  "generative",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPrompt(value: unknown): boolean {
  if (!isRecord(value)) {
    return false;
  }
  if (
    typeof value.id !== "string" ||
    typeof value.category !== "string" ||
    typeof value.mode !== "string"
  ) {
    return false;
  }
  if (value.mode === "drag-match") {
    return (
      typeof value.wordLabel === "string" &&
      Array.isArray(value.imageOptions) &&
      value.imageOptions.every((item) => typeof item === "string") &&
      typeof value.target === "string"
    );
  }
  if (value.mode === "click-paint") {
    const targetOk =
      typeof value.target === "string" ||
      (Array.isArray(value.target) &&
        value.target.every((item) => typeof item === "string"));
    return (
      typeof value.text === "string" &&
      targetOk &&
      Array.isArray(value.options) &&
      value.options.every((item) => typeof item === "string")
    );
  }
  return false;
}

function validateWeek(weekNumber: number, lesson: Record<string, unknown>): string | null {
  if (lesson.weekNumber !== weekNumber) {
    return `Week ${weekNumber} has mismatched weekNumber.`;
  }
  if (typeof lesson.theme !== "string" || lesson.theme.length < 1) {
    return `Week ${weekNumber} is missing a theme.`;
  }
  const brackets = lesson.brackets;
  if (!isRecord(brackets)) {
    return `Week ${weekNumber} brackets must be an object.`;
  }

  for (const group of AGE_GROUPS) {
    const bracket = brackets[group];
    if (!isRecord(bracket)) {
      return `Week ${weekNumber} is missing bracket ${group}.`;
    }
    if (
      typeof bracket.videoId !== "string" ||
      typeof bracket.channel !== "string" ||
      typeof bracket.title !== "string" ||
      (bracket.mode !== "drag-match" && bracket.mode !== "click-paint") ||
      !Array.isArray(bracket.prompts)
    ) {
      return `Week ${weekNumber}, age ${group} has invalid bracket metadata.`;
    }
    if (bracket.prompts.length !== 10) {
      return `Week ${weekNumber}, age ${group} has ${bracket.prompts.length} prompts (expected 10).`;
    }
    for (let index = 0; index < bracket.prompts.length; index += 1) {
      const prompt = bracket.prompts[index];
      if (!isPrompt(prompt) || !isRecord(prompt)) {
        return `Week ${weekNumber}, age ${group}, prompt ${index} is invalid.`;
      }
      if (weekNumber === 1) {
        if (prompt.category !== "core") {
          return `Week 1, age ${group}, prompt ${index} must be core.`;
        }
        continue;
      }
      if (prompt.category !== EXPECTED_CATEGORIES[index]) {
        return `Week ${weekNumber}, age ${group}, prompt ${index} has wrong category.`;
      }
    }
  }

  return null;
}

export function validateCurriculumCatalog(raw: unknown): string | null {
  if (!isRecord(raw)) {
    return "Curriculum must be a JSON object keyed by week number.";
  }

  const weekNumbers = Object.keys(raw)
    .map(Number)
    .filter((week) => Number.isInteger(week) && week >= 1);

  if (weekNumbers.length === 0) {
    return "Curriculum must include at least one week.";
  }

  for (let week = 1; week <= 8; week += 1) {
    if (!raw[String(week)]) {
      return `Curriculum must include all weeks 1–8 (missing week ${week}).`;
    }
  }

  weekNumbers.sort((a, b) => a - b);

  for (const weekNumber of weekNumbers) {
    const lesson = raw[String(weekNumber)];
    if (!isRecord(lesson)) {
      return `Week ${weekNumber} must be an object.`;
    }
    const error = validateWeek(weekNumber, lesson);
    if (error) {
      return error;
    }
  }

  return null;
}

export function normalizeRevisionTag(raw: unknown): string | null {
  if (typeof raw !== "string") {
    return null;
  }
  const tag = raw.trim().slice(0, 64);
  if (tag.length < 1 || !/^[a-zA-Z0-9._-]+$/.test(tag)) {
    return null;
  }
  return tag;
}
