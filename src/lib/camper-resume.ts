import { reconcileAchievementsWithProgress } from "@/lib/achievements";
import {
  applyCampProgressSnapshot,
  captureCampProgressSnapshot,
  type CampProgressSnapshot,
} from "@/lib/camp-progress-snapshot";
import { touchCampSessionClock } from "@/lib/session-store";
import { getCopy } from "@/lib/i18n/copy";
import {
  isEdgeFetchFailure,
  postEdgeFunction,
  type EdgeFetchFailure,
} from "@/lib/supabase/edge-functions";
import { getSupabaseConfig } from "@/lib/supabase/client";

export interface CreateResumeCodeResult {
  ok: true;
  resumeCode: string;
  expiresAt: string;
}

export type CreateResumeCodeError = {
  ok: false;
  error: string;
};

export type RestoreResumeCodeResult =
  | { ok: true; snapshot: CampProgressSnapshot }
  | { ok: false; error: string };

function resumeReachabilityError(failure: EdgeFetchFailure): string {
  const copy = getCopy("en");
  if (failure.kind === "not_configured") {
    return copy.resume.errors.notConfigured;
  }
  return copy.resume.errors.network;
}

async function postResumeFunction(
  body: Record<string, unknown>,
): Promise<Response | EdgeFetchFailure> {
  return postEdgeFunction("camper-resume", body);
}

export async function createResumeCode(): Promise<
  CreateResumeCodeResult | CreateResumeCodeError
> {
  let snapshot = captureCampProgressSnapshot();
  if (!snapshot) {
    return { ok: false, error: "No camper session on this device." };
  }

  if (!snapshot.sessionStartedAt) {
    touchCampSessionClock();
    snapshot = captureCampProgressSnapshot();
    if (!snapshot?.sessionStartedAt) {
      return { ok: false, error: "Could not verify this device session." };
    }
  }

  const tokenResponse = await postResumeFunction({
    action: "issue-create-token",
    camper_id: snapshot.camper.camper_id,
    session_started_at: snapshot.sessionStartedAt,
  });
  if (isEdgeFetchFailure(tokenResponse)) {
    return { ok: false, error: resumeReachabilityError(tokenResponse) };
  }

  const tokenPayload = (await tokenResponse.json().catch(() => null)) as {
    create_token?: string;
    error?: string;
  } | null;

  if (!tokenResponse.ok || !tokenPayload?.create_token) {
    return {
      ok: false,
      error: tokenPayload?.error ?? "Could not authorize resume code.",
    };
  }

  const response = await postResumeFunction({
    action: "create",
    create_token: tokenPayload.create_token,
    snapshot,
  });
  if (isEdgeFetchFailure(response)) {
    return { ok: false, error: resumeReachabilityError(response) };
  }

  const payload = (await response.json().catch(() => null)) as {
    resume_code?: string;
    expires_at?: string;
    error?: string;
  } | null;

  if (!response.ok || !payload?.resume_code || !payload.expires_at) {
    return {
      ok: false,
      error: payload?.error ?? "Could not create resume code.",
    };
  }

  return {
    ok: true,
    resumeCode: payload.resume_code,
    expiresAt: payload.expires_at,
  };
}

export async function restoreFromResumeCode(
  code: string,
): Promise<RestoreResumeCodeResult> {
  const normalized = code.trim().toUpperCase();
  if (normalized.length !== 6) {
    return { ok: false, error: "Enter the 6-character code." };
  }

  const response = await postResumeFunction({
    action: "restore",
    code: normalized,
  });
  if (isEdgeFetchFailure(response)) {
    return { ok: false, error: resumeReachabilityError(response) };
  }

  const payload = (await response.json().catch(() => null)) as {
    snapshot?: CampProgressSnapshot;
    error?: string;
  } | null;

  if (!response.ok || !payload?.snapshot?.camper) {
    return {
      ok: false,
      error: payload?.error ?? "Invalid or expired code.",
    };
  }

  const applied = applyCampProgressSnapshot(payload.snapshot);
  if (!applied) {
    return { ok: false, error: "Could not apply progress from that code." };
  }

  reconcileAchievementsWithProgress();

  return { ok: true, snapshot: payload.snapshot };
}

export async function verifyCounselorPin(pin: string): Promise<boolean> {
  const config = getSupabaseConfig();
  if (!config) {
    return false;
  }

  try {
    const response = await fetch(`${config.url}/functions/v1/counselor-reset`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        apikey: config.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) {
      return false;
    }

    const payload = (await response.json()) as { ok?: boolean };
    return payload.ok === true;
  } catch {
    return false;
  }
}
