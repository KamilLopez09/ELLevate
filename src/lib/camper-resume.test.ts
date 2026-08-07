import { beforeEach, describe, expect, it, vi } from "vitest";
import { restoreFromResumeCode } from "@/lib/camper-resume";
import { reconcileAchievementsWithProgress } from "@/lib/achievements";
import { applyCampProgressSnapshot } from "@/lib/camp-progress-snapshot";
import { postEdgeFunction } from "@/lib/supabase/edge-functions";
import type { CampProgressSnapshot } from "@/lib/camp-progress-snapshot";

vi.mock("@/lib/achievements", () => ({
  reconcileAchievementsWithProgress: vi.fn(),
}));

vi.mock("@/lib/camp-progress-snapshot", () => ({
  applyCampProgressSnapshot: vi.fn(),
  captureCampProgressSnapshot: vi.fn(),
}));

vi.mock("@/lib/session-store", () => ({
  touchCampSessionClock: vi.fn(),
}));

vi.mock("@/lib/supabase/client", () => ({
  getSupabaseConfig: vi.fn(),
}));

vi.mock("@/lib/supabase/edge-functions", () => ({
  postEdgeFunction: vi.fn(),
  isEdgeFetchFailure: (result: Response | { kind: string }) => "kind" in result,
}));

const snapshot: CampProgressSnapshot = {
  camper: {
    camper_id: "ada-l",
    first_name: "Ada",
    last_initial: "L",
    age_bracket: "10-14",
    native_language: "English",
    group_letter: "A",
    cumulativeScore: 120,
    completedModes: ["sentence_builder"],
    unlockedAchievements: [],
  },
  currentWeek: 2,
  weekPassed: { "1": true },
};

const applyCampProgressSnapshotMock = vi.mocked(applyCampProgressSnapshot);
const postEdgeFunctionMock = vi.mocked(postEdgeFunction);
const reconcileAchievementsWithProgressMock = vi.mocked(
  reconcileAchievementsWithProgress,
);

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status });
}

describe("restoreFromResumeCode", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("consumes a resume code only after the snapshot applies locally", async () => {
    applyCampProgressSnapshotMock.mockReturnValue(true);
    postEdgeFunctionMock
      .mockResolvedValueOnce(
        jsonResponse({ snapshot, restore_token: "restore-token" }),
      )
      .mockResolvedValueOnce(jsonResponse({ ok: true }));

    const result = await restoreFromResumeCode("abc123");

    expect(result.ok).toBe(true);
    expect(applyCampProgressSnapshotMock).toHaveBeenCalledWith(snapshot);
    expect(reconcileAchievementsWithProgressMock).toHaveBeenCalledOnce();
    expect(postEdgeFunctionMock).toHaveBeenNthCalledWith(1, "camper-resume", {
      action: "restore",
      code: "ABC123",
    });
    expect(postEdgeFunctionMock).toHaveBeenNthCalledWith(2, "camper-resume", {
      action: "consume-restore",
      code: "ABC123",
      restore_token: "restore-token",
    });
  });

  it("leaves the server code unconsumed when local snapshot application fails", async () => {
    applyCampProgressSnapshotMock.mockReturnValue(false);
    postEdgeFunctionMock.mockResolvedValueOnce(
      jsonResponse({ snapshot, restore_token: "restore-token" }),
    );

    const result = await restoreFromResumeCode("abc123");

    expect(result).toEqual({ ok: false, code: "apply_failed" });
    expect(postEdgeFunctionMock).toHaveBeenCalledTimes(1);
    expect(postEdgeFunctionMock).toHaveBeenCalledWith("camper-resume", {
      action: "restore",
      code: "ABC123",
    });
    expect(reconcileAchievementsWithProgressMock).not.toHaveBeenCalled();
  });
});
