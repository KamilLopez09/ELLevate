import { act, createElement, type ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROGRESS_SYNCED_EVENT } from "@/lib/progress-events";
import type { GroupLeaderboardResult } from "@/lib/group-leaderboard";

const mocks = vi.hoisted(() => ({
  fetchGroupLeaderboard: vi.fn(),
}));

vi.mock("@/lib/group-leaderboard", () => ({
  fetchGroupLeaderboard: mocks.fetchGroupLeaderboard,
}));

vi.mock("@/lib/i18n/useCopy", () => ({
  useCopy: () => ({
    leaderboard: {
      title: "Group standings",
      loading: "Loading standings",
      empty: "No standings",
      yourRank: (rank: number, total: number, group: string) =>
        `You are #${rank} of ${total} in Group ${group}`,
      groupLabel: (group: string) => `Group ${group}`,
      you: "You",
      points: "pts",
    },
  }),
}));

vi.mock("@/components/ui/BentoGrid", () => ({
  BentoCard: ({ children }: { children: ReactNode }) => children,
}));

import { GroupStandingsCard } from "@/components/menu/GroupStandingsCard";

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean })
  .IS_REACT_ACT_ENVIRONMENT = true;

const leaderboard: GroupLeaderboardResult = {
  group_letter: "A",
  entries: [
    {
      rank: 1,
      camper_id: "maria-g",
      display_name: "Maria G.",
      cumulative_score: 450,
      weeks_passed: 3,
      is_you: true,
    },
  ],
  your_rank: 1,
  total_in_group: 1,
};

describe("GroupStandingsCard", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    vi.useFakeTimers();
    mocks.fetchGroupLeaderboard.mockReset();
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    vi.useRealTimers();
  });

  it("keeps the last standings when a background refresh fails", async () => {
    mocks.fetchGroupLeaderboard
      .mockResolvedValueOnce(leaderboard)
      .mockResolvedValueOnce(null);

    await act(async () => {
      root.render(
        createElement(GroupStandingsCard, {
          groupLetter: "A",
          camperId: "maria-g",
        }),
      );
    });

    expect(container.textContent).toContain("Maria G.");
    expect(container.textContent).toContain("450");

    await act(async () => {
      window.dispatchEvent(new Event(PROGRESS_SYNCED_EVENT));
    });

    expect(mocks.fetchGroupLeaderboard).toHaveBeenCalledTimes(2);
    expect(container.textContent).toContain("Maria G.");
    expect(container.textContent).toContain("450");
    expect(container.textContent).not.toContain("No standings");
  });

  it("does not passive-poll at the old 30 second cadence", async () => {
    mocks.fetchGroupLeaderboard.mockResolvedValue(leaderboard);

    await act(async () => {
      root.render(
        createElement(GroupStandingsCard, {
          groupLetter: "A",
          camperId: "maria-g",
        }),
      );
    });

    expect(mocks.fetchGroupLeaderboard).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(30_000);
    });

    expect(mocks.fetchGroupLeaderboard).toHaveBeenCalledTimes(1);

    await act(async () => {
      vi.advanceTimersByTime(4 * 60_000 + 30_000);
      await Promise.resolve();
    });

    expect(mocks.fetchGroupLeaderboard).toHaveBeenCalledTimes(2);
  });
});
