import { describe, expect, it } from "vitest";
import { acceptPromptCompletion } from "@/lib/prompt-completion-gate";

describe("acceptPromptCompletion", () => {
  it("rejects duplicate completions for the same prompt index", () => {
    const completed = new Set<number>();

    expect(acceptPromptCompletion(completed, 0)).toBe(true);
    expect(acceptPromptCompletion(completed, 0)).toBe(false);
  });

  it("allows a later prompt index after an earlier prompt completed", () => {
    const completed = new Set<number>();

    expect(acceptPromptCompletion(completed, 0)).toBe(true);
    expect(acceptPromptCompletion(completed, 1)).toBe(true);
  });
});
