import type { CurriculumCatalog } from "@/data/curriculum";
import { curriculum as bundledCurriculum } from "@/data/curriculum";
import { getSupabaseConfig } from "@/lib/supabase/client";
import { parseCurriculumCatalog } from "@/lib/curriculum-validate";

const CACHE_KEY = "elle_curriculum_cache_v1";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export type CurriculumSource = "bundled" | "remote";

export interface RemoteCurriculumPayload {
  active: boolean;
  revision_tag: string;
  published_at: string;
  content: CurriculumCatalog;
}

interface CurriculumCacheEntry {
  revision_tag: string;
  published_at: string;
  content: CurriculumCatalog;
  cached_at: number;
}

function readCache(): CurriculumCacheEntry | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as CurriculumCacheEntry;
    if (
      !parsed?.revision_tag ||
      !parsed.content ||
      typeof parsed.cached_at !== "number"
    ) {
      return null;
    }
    if (Date.now() - parsed.cached_at > CACHE_TTL_MS) {
      return null;
    }
    const catalog = parseCurriculumCatalog(parsed.content);
    if (!catalog) {
      return null;
    }
    return { ...parsed, content: catalog };
  } catch {
    return null;
  }
}

function writeCache(payload: RemoteCurriculumPayload): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const entry: CurriculumCacheEntry = {
      revision_tag: payload.revision_tag,
      published_at: payload.published_at,
      content: payload.content,
      cached_at: Date.now(),
    };
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
  } catch {
    // Quota or private browsing — skip cache.
  }
}

export function clearCurriculumCache(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(CACHE_KEY);
}

export interface FetchRemoteCurriculumResult {
  catalog: CurriculumCatalog | null;
  revisionTag: string | null;
  source: CurriculumSource;
}

function resultFromCache(cached: CurriculumCacheEntry): FetchRemoteCurriculumResult {
  return {
    catalog: cached.content,
    revisionTag: cached.revision_tag,
    source: "remote",
  };
}

/** Load remote curriculum with ETag revalidation, localStorage cache, and bundled fallback. */
export async function fetchRemoteCurriculum(): Promise<FetchRemoteCurriculumResult> {
  const cached = readCache();
  const config = getSupabaseConfig();
  if (!config) {
    return {
      catalog: null,
      revisionTag: null,
      source: "bundled",
    };
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${config.key}`,
      apikey: config.key,
    };
    if (cached) {
      headers["If-None-Match"] = `"${cached.revision_tag}"`;
    }

    const response = await fetch(
      `${config.url}/functions/v1/curriculum-fetch`,
      { method: "GET", headers },
    );

    if (response.status === 304 && cached) {
      return resultFromCache(cached);
    }

    if (response.status === 404) {
      clearCurriculumCache();
      return {
        catalog: null,
        revisionTag: null,
        source: "bundled",
      };
    }

    if (!response.ok) {
      if (cached) {
        return resultFromCache(cached);
      }
      return {
        catalog: null,
        revisionTag: null,
        source: "bundled",
      };
    }

    const payload = (await response.json()) as RemoteCurriculumPayload;
    if (!payload.active || !payload.content) {
      clearCurriculumCache();
      return {
        catalog: null,
        revisionTag: null,
        source: "bundled",
      };
    }

    const catalog = parseCurriculumCatalog(payload.content);
    if (!catalog) {
      if (cached) {
        return resultFromCache(cached);
      }
      return {
        catalog: null,
        revisionTag: null,
        source: "bundled",
      };
    }

    writeCache(payload);

    return {
      catalog,
      revisionTag: payload.revision_tag,
      source: "remote",
    };
  } catch {
    if (cached) {
      return resultFromCache(cached);
    }
    return {
      catalog: null,
      revisionTag: null,
      source: "bundled",
    };
  }
}

export function getBundledCurriculum(): CurriculumCatalog {
  return bundledCurriculum;
}
