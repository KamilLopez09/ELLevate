import {
  applyCampProgressSnapshot,
  captureCampProgressSnapshot,
  type CampProgressSnapshot,
} from "@/lib/camp-progress-snapshot";
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

async function postResumeFunction(
  body: Record<string, unknown>,
): Promise<Response | null> {
  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  try {
    return await fetch(`${config.url}/functions/v1/camper-resume`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        apikey: config.key,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return null;
  }
}

export async function createResumeCode(): Promise<
  CreateResumeCodeResult | CreateResumeCodeError
> {
  const snapshot = captureCampProgressSnapshot();
  if (!snapshot) {
    return { ok: false, error: "No camper session on this device." };
  }

  const response = await postResumeFunction({ action: "create", snapshot });
  if (!response) {
    return { ok: false, error: "Could not reach camp servers." };
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
  if (!response) {
    return { ok: false, error: "Could not reach camp servers." };
  }

  const payload = (await response.json().catch(() => null)) as {
    snapshot?: CampProgressSnapshot;
    error?: string;
  } | null;

  if (!response.ok || !payload?.snapshot?.camper) {
    return {
      ok: false,
      error: payload?.error ?? "Could not restore from that code.",
    };
  }

  applyCampProgressSnapshot(payload.snapshot);
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
