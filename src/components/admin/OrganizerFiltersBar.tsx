"use client";

import { Button } from "@/components/ui/button";
import { TOTAL_WEEKS, WEEK_NUMBERS } from "@/lib/curriculum-engine";
import {
  EMPTY_ORGANIZER_FILTERS,
  hasActiveFilters,
  type OrganizerFilters,
} from "@/lib/organizer-filters";

export interface OrganizerFiltersBarProps {
  filters: OrganizerFilters;
  groupOptions: string[];
  filteredCount: number;
  totalCount: number;
  onChange: (filters: OrganizerFilters) => void;
  onReset: () => void;
}

const fieldClass =
  "min-h-[44px] w-full rounded-xl border border-border bg-background px-3 text-sm text-ink";

export function OrganizerFiltersBar({
  filters,
  groupOptions,
  filteredCount,
  totalCount,
  onChange,
  onReset,
}: OrganizerFiltersBarProps) {
  return (
    <section
      className="space-y-4 rounded-2xl border border-border bg-paper p-5 shadow-bento"
      aria-label="Filter camper sessions"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-extrabold text-ink">Filters</h2>
          <p className="mt-1 text-sm text-ink/60">
            Showing {filteredCount} of {totalCount} session
            {totalCount === 1 ? "" : "s"} (client-side on loaded data).
          </p>
        </div>
        {hasActiveFilters(filters) ? (
          <Button type="button" variant="outline" size="sm" onClick={onReset}>
            Clear filters
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">Week</span>
          <select
            className={fieldClass}
            value={filters.week === "all" ? "all" : String(filters.week)}
            onChange={(event) => {
              const value = event.target.value;
              onChange({
                ...filters,
                week: value === "all" ? "all" : Number(value),
              });
            }}
          >
            <option value="all">All weeks (1–{TOTAL_WEEKS})</option>
            {WEEK_NUMBERS.map((week) => (
              <option key={week} value={week}>
                Week {week}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">Camp group</span>
          <select
            className={fieldClass}
            value={filters.group}
            onChange={(event) =>
              onChange({ ...filters, group: event.target.value })
            }
          >
            <option value="all">All groups</option>
            {groupOptions.map((group) => (
              <option key={group} value={group}>
                Group {group}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">From date</span>
          <input
            type="date"
            className={fieldClass}
            value={filters.dateFrom}
            onChange={(event) =>
              onChange({ ...filters, dateFrom: event.target.value })
            }
          />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-semibold text-ink">To date</span>
          <input
            type="date"
            className={fieldClass}
            value={filters.dateTo}
            onChange={(event) =>
              onChange({ ...filters, dateTo: event.target.value })
            }
          />
        </label>
      </div>
    </section>
  );
}

export { EMPTY_ORGANIZER_FILTERS };
