"use client";

import { createContext, useContext, useMemo } from "react";
import { curriculum as bundledCurriculum, type CurriculumCatalog } from "@/data/curriculum";

interface CurriculumContextValue {
  curriculum: CurriculumCatalog;
}

const CurriculumContext = createContext<CurriculumContextValue | null>(null);

export function CurriculumProvider({ children }: { children: React.ReactNode }) {
  const value = useMemo(() => ({ curriculum: bundledCurriculum }), []);

  return <CurriculumContext value={value}>{children}</CurriculumContext>;
}

export function useCurriculum(): CurriculumContextValue {
  const ctx = useContext(CurriculumContext);
  if (!ctx) {
    throw new Error("useCurriculum must be used within CurriculumProvider");
  }
  return ctx;
}
