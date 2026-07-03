"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CurriculumCatalog } from "@/data/curriculum";
import { setActiveCurriculum } from "@/lib/curriculum-active";
import {
  fetchRemoteCurriculum,
  getBundledCurriculum,
  type CurriculumSource,
} from "@/lib/remote-curriculum";

interface CurriculumContextValue {
  curriculum: CurriculumCatalog;
  revisionTag: string | null;
  source: CurriculumSource;
  isLoading: boolean;
  refresh: () => Promise<void>;
}

const CurriculumContext = createContext<CurriculumContextValue | null>(null);

export function CurriculumProvider({ children }: { children: React.ReactNode }) {
  const [curriculum, setCurriculum] = useState<CurriculumCatalog>(
    getBundledCurriculum(),
  );
  const [revisionTag, setRevisionTag] = useState<string | null>(null);
  const [source, setSource] = useState<CurriculumSource>("bundled");
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const result = await fetchRemoteCurriculum();
    if (result.catalog) {
      setActiveCurriculum(result.catalog);
      setCurriculum(result.catalog);
      setRevisionTag(result.revisionTag);
      setSource(result.source);
    } else {
      const bundled = getBundledCurriculum();
      setActiveCurriculum(bundled);
      setCurriculum(bundled);
      setRevisionTag(null);
      setSource("bundled");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      curriculum,
      revisionTag,
      source,
      isLoading,
      refresh,
    }),
    [curriculum, revisionTag, source, isLoading, refresh],
  );

  return (
    <CurriculumContext value={value}>{children}</CurriculumContext>
  );
}

export function useCurriculum(): CurriculumContextValue {
  const ctx = useContext(CurriculumContext);
  if (!ctx) {
    throw new Error("useCurriculum must be used within CurriculumProvider");
  }
  return ctx;
}
