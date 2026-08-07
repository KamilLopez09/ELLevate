import { reconcileAchievementsWithProgress } from "@/lib/achievements";
import {
  applyCampProgressSnapshot,
  captureCampProgressSnapshot,
  type CampProgressSnapshot,
} from "@/lib/camp-progress-snapshot";
import type { ResumeErrorCode } from "@/lib/resume-errors";
import { touchCampSessionClock } from "@/lib/session-store";
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
  code: ResumeErrorCode;
};

export type RestoreResumeCodeResult =
  | { ok: true; snapshot: CampProgressSnapshot }
  | { ok: false; code: ResumeErrorCode };

function networkCode(failure: EdgeFetchFailure): ResumeErrorCode {
  if (failure.kind === "not_configured") {
    return "not_configured";
  }
  return "network";
}

async function postResumeFunction(
  body: Record<string, unknown>,
): Promise<Response | EdgeFetchFailure> {
  return postEdgeFunction("camper-resume", body);
}

function parseErrorCode(
  payload: { error_code?: string } | null,
  fallback: ResumeErrorCode,
): ResumeErrorCode {
  const code = payload?.error_code;
  if (code === "invalid_session") {
    return "session_unverified";
  }
  if (typeof code === "string") {
    return code as ResumeErrorCode;
  }
  return fallback;
}

async function consumeRestoredResumeCode(
  code: string,
  restoreToken: string,
): Promise<void> {
  const response = await postResumeFunction({
    action: "consume-restore",
    code,
    restore_token: restoreToken,
  });

  if (isEdgeFetchFailure(response)) {
    return;
  }

  await response.body?.cancel().catch(() => undefined);
}

export async function createResumeCode(): Promise<
  CreateResumeCodeResult | CreateResumeCodeError
> {
  let snapshot = captureCampProgressSnapshot();
  if (!snapshot) {
    return { ok: false, code: "no_session" };
  }

  if (!snapshot.sessionStartedAt) {
    touchCampSessionClock();
    snapshot = captureCampProgressSnapshot();
    if (!snapshot?.sessionStartedAt) {
      return { ok: false, code: "session_unverified" };
    }
  }

  const tokenResponse = await postResumeFunction({
    action: "issue-create-token",
    camper_id: snapshot.camper.camper_id,
    session_started_at: snapshot.sessionStartedAt,
  });
  if (isEdgeFetchFailure(tokenResponse)) {
    return { ok: false, code: networkCode(tokenResponse) };
  }

  const tokenPayload = (await tokenResponse.json().catch(() => null)) as {
    create_token?: string;
    error_code?: string;
  } | null;

  if (tokenResponse.status === 429) {
    return { ok: false, code: "rate_limited" };
  }

  if (!tokenResponse.ok || !tokenPayload?.create_token) {
    return {
      ok: false,
      code: parseErrorCode(tokenPayload, "authorize_failed"),
    };
  }

  const response = await postResumeFunction({
    action: "create",
    create_token: tokenPayload.create_token,
    snapshot,
  });
  if (isEdgeFetchFailure(response)) {
    return { ok: false, code: networkCode(response) };
  }

  const payload = (await response.json().catch(() => null)) as {
    resume_code?: string;
    expires_at?: string;
    error_code?: string;
  } | null;

  if (response.status === 429) {
    return {
      ok: false,
      code: parseErrorCode(payload, "rate_limited"),
    };
  }

  if (!response.ok || !payload?.resume_code || !payload.expires_at) {
    return {
      ok: false,
      code: parseErrorCode(payload, "create_failed"),
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
    return { ok: false, code: "invalid_code" };
  }

  const response = await postResumeFunction({
    action: "restore",
    code: normalized,
  });
  if (isEdgeFetchFailure(response)) {
    return { ok: false, code: networkCode(response) };
  }

  const payload = (await response.json().catch(() => null)) as {
    snapshot?: CampProgressSnapshot;
    restore_token?: string;
    error_code?: string;
  } | null;

  if (response.status === 429) {
    return { ok: false, code: "rate_limited" };
  }

  if (!response.ok || !payload?.snapshot?.camper) {
    return {
      ok: false,
      code: parseErrorCode(payload, "not_found"),
    };
  }

  const applied = applyCampProgressSnapshot(payload.snapshot);
  if (!applied) {
    return { ok: false, code: "apply_failed" };
  }

  reconcileAchievementsWithProgress();

  if (typeof payload.restore_token === "string") {
    await consumeRestoredResumeCode(normalized, payload.restore_token).catch(
      () => undefined,
    );
  }

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
