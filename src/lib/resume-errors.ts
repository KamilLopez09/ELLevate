import type { CampCopy } from "@/lib/i18n/types";

export type ResumeErrorCode =
  | "invalid_code"
  | "not_found"
  | "network"
  | "not_configured"
  | "rate_limited"
  | "no_session"
  | "session_unverified"
  | "authorize_failed"
  | "create_failed"
  | "too_many_active"
  | "apply_failed";

export function resumeErrorMessage(
  code: ResumeErrorCode,
  errors: CampCopy["resume"]["errors"],
): string {
  switch (code) {
    case "invalid_code":
      return errors.invalidCode;
    case "not_found":
      return errors.notFound;
    case "network":
      return errors.network;
    case "not_configured":
      return errors.notConfigured;
    case "rate_limited":
      return errors.rateLimited;
    case "no_session":
      return errors.noSession;
    case "session_unverified":
      return errors.sessionUnverified;
    case "authorize_failed":
      return errors.authorizeFailed;
    case "create_failed":
      return errors.createFailed;
    case "too_many_active":
      return errors.tooManyActive;
    case "apply_failed":
      return errors.applyFailed;
    default:
      return errors.createFailed;
  }
}
