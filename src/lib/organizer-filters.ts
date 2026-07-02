import type { CamperTelemetryRecord, OrganizerSummary } from "@/lib/organizer-api";

export type WeekFilter = "all" | number;

export interface OrganizerFilters {
  week: WeekFilter;
  group: string;
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_ORGANIZER_FILTERS: OrganizerFilters = {
  week: "all",
  group: "all",
  dateFrom: "",
  dateTo: "",
};

export function hasActiveFilters(filters: OrganizerFilters): boolean {
  return (
    filters.week !== "all" ||
    filters.group !== "all" ||
    filters.dateFrom !== "" ||
    filters.dateTo !== ""
  );
}

function completedDateKey(iso: string): string {
  try {
    return iso.slice(0, 10);
  } catch {
    return "";
  }
}

export function filterTelemetryRows(
  rows: CamperTelemetryRecord[],
  filters: OrganizerFilters,
): CamperTelemetryRecord[] {
  return rows.filter((row) => {
    if (filters.week !== "all" && row.week_number !== filters.week) {
      return false;
    }
    if (filters.group !== "all" && row.group_letter !== filters.group) {
      return false;
    }
    const day = completedDateKey(row.completed_at);
    if (filters.dateFrom && day < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && day > filters.dateTo) {
      return false;
    }
    return true;
  });
}

export function buildSummaryFromRows(
  rows: CamperTelemetryRecord[],
): OrganizerSummary {
  const passesByWeek: Record<string, number> = {};
  const passesByGroup: Record<string, number> = {};
  const camperIds = new Set<string>();

  for (const row of rows) {
    camperIds.add(row.camper_id);
    const weekKey = String(row.week_number);
    passesByWeek[weekKey] = (passesByWeek[weekKey] ?? 0) + 1;
    passesByGroup[row.group_letter] =
      (passesByGroup[row.group_letter] ?? 0) + 1;
  }

  return {
    totalSessions: rows.length,
    uniqueCampers: camperIds.size,
    passesByWeek,
    passesByGroup,
  };
}

export function uniqueGroupLetters(rows: CamperTelemetryRecord[]): string[] {
  const groups = new Set<string>();
  for (const row of rows) {
    if (row.group_letter) {
      groups.add(row.group_letter);
    }
  }
  return [...groups].sort((a, b) => a.localeCompare(b));
}

export function exportFilenameSuffix(filters: OrganizerFilters): string {
  const parts: string[] = [];
  if (filters.week !== "all") {
    parts.push(`week-${filters.week}`);
  }
  if (filters.group !== "all") {
    parts.push(`group-${filters.group.toLowerCase()}`);
  }
  if (filters.dateFrom) {
    parts.push(`from-${filters.dateFrom}`);
  }
  if (filters.dateTo) {
    parts.push(`to-${filters.dateTo}`);
  }
  return parts.length > 0 ? `-${parts.join("-")}` : "";
}
