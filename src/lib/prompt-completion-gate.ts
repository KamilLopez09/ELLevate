/**
 * Marks a prompt completion as accepted once per prompt index.
 * Duplicate child callbacks can arrive before React commits the next prompt.
 */
export function acceptPromptCompletion(
  completedPromptIndices: Set<number>,
  promptIndex: number,
): boolean {
  if (completedPromptIndices.has(promptIndex)) {
    return false;
  }

  completedPromptIndices.add(promptIndex);
  return true;
}
