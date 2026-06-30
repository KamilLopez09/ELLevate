/**
 * Browser session persistence for camp progress.
 *
 * Uses localStorage with a 12-hour TTL so campers keep progress if they
 * refresh or accidentally close the tab. Counselors can reset between
 * campers with clearCampSession().
 */

const SESSION_STARTED_AT_KEY = "elle_session_started_at";
export const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readStartedAt(): number | null {
  if (!isBrowser()) {
    return null;
  }
  const raw = window.localStorage.getItem(SESSION_STARTED_AT_KEY);
  if (!raw) {
    return null;
  }
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isCampSessionExpired(): boolean {
  const startedAt = readStartedAt();
  if (startedAt === null) {
    return false;
  }
  return Date.now() - startedAt > SESSION_TTL_MS;
}

/** Call when a new camp session begins (intake submit). */
export function touchCampSessionClock(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(SESSION_STARTED_AT_KEY, String(Date.now()));
}

export function getCampSessionItem(key: string): string | null {
  if (!isBrowser()) {
    return null;
  }
  if (isCampSessionExpired()) {
    clearCampSessionStorage();
    return null;
  }
  return window.localStorage.getItem(key);
}

export function setCampSessionItem(key: string, value: string): void {
  if (!isBrowser()) {
    return;
  }
  if (!readStartedAt()) {
    touchCampSessionClock();
  }
  window.localStorage.setItem(key, value);
}

export function removeCampSessionItem(key: string): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(key);
}

/** Removes all ELLevate progress keys (use between campers on a shared tablet). */
export function clearCampSessionStorage(extraKeys: string[] = []): void {
  if (!isBrowser()) {
    return;
  }

  const keys = new Set([
    SESSION_STARTED_AT_KEY,
    ...extraKeys,
  ]);

  for (const key of keys) {
    window.localStorage.removeItem(key);
  }

  // Clean up legacy sessionStorage from older builds.
  for (const key of keys) {
    window.sessionStorage.removeItem(key);
  }
}
