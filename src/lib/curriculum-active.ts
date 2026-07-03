import {
  curriculum as bundledCurriculum,
  type CurriculumCatalog,
} from "@/data/curriculum";

let activeCurriculum: CurriculumCatalog = bundledCurriculum;

export function getActiveCurriculum(): CurriculumCatalog {
  return activeCurriculum;
}

export function setActiveCurriculum(catalog: CurriculumCatalog): void {
  activeCurriculum = catalog;
}

export function resetActiveCurriculum(): void {
  activeCurriculum = bundledCurriculum;
}
