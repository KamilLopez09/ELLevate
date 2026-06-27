import type { CamperSessionData } from "@/types/sentence-canvas";

export const CAMPER_SESSION_KEY = "camperSessionData";

/**
 * Converts a display name into a URL/DB-safe id.
 * "María G." -> "maria-g"
 */
export function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function readCamperSession(): CamperSessionData | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(CAMPER_SESSION_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<CamperSessionData>;
    if (
      !parsed.camper_id ||
      !parsed.display_name ||
      !parsed.age_bracket ||
      !parsed.native_language ||
      !parsed.group_letter
    ) {
      return null;
    }
    return parsed as CamperSessionData;
  } catch {
    return null;
  }
}

export function writeCamperSession(data: CamperSessionData): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(CAMPER_SESSION_KEY, JSON.stringify(data));
}
