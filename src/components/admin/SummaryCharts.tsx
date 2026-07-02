"use client";

export interface ChartDatum {
  label: string;
  value: number;
}

export interface SummaryChartsProps {
  passesByWeek: Record<string, number>;
  passesByGroup: Record<string, number>;
}

function sortNumericKeys(record: Record<string, number>): ChartDatum[] {
  return Object.entries(record)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([label, value]) => ({ label, value }));
}

function sortAlphaKeys(record: Record<string, number>): ChartDatum[] {
  return Object.entries(record)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([label, value]) => ({ label, value }));
}

function BarChart({
  title,
  data,
  valueLabel,
}: {
  title: string;
  data: ChartDatum[];
  valueLabel: (value: number) => string;
}) {
  const max = Math.max(1, ...data.map((entry) => entry.value));

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-paper p-5 shadow-bento">
        <h3 className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
          {title}
        </h3>
        <p className="mt-4 text-sm text-ink/60">No passes in this filter.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-paper p-5 shadow-bento">
      <h3 className="text-bento-label font-semibold uppercase tracking-widest text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-5 space-y-3" aria-label={title}>
        {data.map((entry) => {
          const width = `${Math.round((entry.value / max) * 100)}%`;
          return (
            <li key={entry.label}>
              <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
                <span className="font-semibold text-ink">{entry.label}</span>
                <span className="tabular-nums text-ink/70">
                  {valueLabel(entry.value)}
                </span>
              </div>
              <div
                className="h-3 overflow-hidden rounded-full bg-camp-blue/40"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-purple-accent transition-[width] duration-300"
                  style={{ width }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function SummaryCharts({
  passesByWeek,
  passesByGroup,
}: SummaryChartsProps) {
  const weekData = sortNumericKeys(passesByWeek).map((entry) => ({
    ...entry,
    label: `Week ${entry.label}`,
  }));
  const groupData = sortAlphaKeys(passesByGroup).map((entry) => ({
    ...entry,
    label: `Group ${entry.label}`,
  }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <BarChart
        title="Passes by week"
        data={weekData}
        valueLabel={(value) => `${value} pass${value === 1 ? "" : "es"}`}
      />
      <BarChart
        title="Passes by group"
        data={groupData}
        valueLabel={(value) => `${value} pass${value === 1 ? "" : "es"}`}
      />
    </div>
  );
}
