import { getSupabaseConfig } from "@/lib/supabase/client";

export interface CamperTelemetryRecord {
  id: string;
  completed_at: string;
  camper_id: string;
  first_name: string;
  last_initial: string;
  age_bracket: string;
  native_language: string;
  group_letter: string;
  week_number: number;
  correct_first_try: number;
  accuracy_rate: number;
  error_count: number;
  game_mode: string;
  total_points: number;
  cumulative_score: number;
}

export interface OrganizerSummary {
  totalSessions: number;
  uniqueCampers: number;
  passesByWeek: Record<string, number>;
  passesByGroup: Record<string, number>;
}

export interface OrganizerTelemetryResponse {
  rows: CamperTelemetryRecord[];
  summary: OrganizerSummary;
}

const ORGANIZER_PASSWORD_KEY = "elle_organizer_password";

export function readStoredOrganizerPassword(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return window.sessionStorage.getItem(ORGANIZER_PASSWORD_KEY) ?? "";
}

export function storeOrganizerPassword(password: string): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.setItem(ORGANIZER_PASSWORD_KEY, password);
}

export function clearStoredOrganizerPassword(): void {
  if (typeof window === "undefined") {
    return;
  }
  window.sessionStorage.removeItem(ORGANIZER_PASSWORD_KEY);
}

export async function fetchOrganizerTelemetry(
  password: string,
  limit = 500,
): Promise<OrganizerTelemetryResponse> {
  const config = getSupabaseConfig();
  if (!config) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  const response = await fetch(
    `${config.url}/functions/v1/organizer-telemetry`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        apikey: config.key,
        "Content-Type": "application/json",
        "x-organizer-password": password,
      },
      body: JSON.stringify({ limit }),
    },
  );

  const payload = (await response.json()) as OrganizerTelemetryResponse & {
    error?: string;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? "Could not load camper data");
  }

  return payload;
}

export function telemetryRowsToCsv(rows: CamperTelemetryRecord[]): string {
  const headers = [
    "completed_at",
    "camper_id",
    "first_name",
    "last_initial",
    "group_letter",
    "age_bracket",
    "native_language",
    "week_number",
    "correct_first_try",
    "accuracy_rate",
    "error_count",
    "game_mode",
    "total_points",
    "cumulative_score",
  ] as const;

  const escape = (value: string | number): string => {
    const text = String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers.map((header) => escape(row[header] ?? "")).join(","),
    ),
  ];

  return lines.join("\n");
}

export function downloadCsv(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
