import type { FindingRecord } from "@devdigest/shared";
import { SEVERITY_ORDER } from "./constants";

export type SeverityCounts = { critical: number; warning: number; suggestion: number };

/** Format a finding's line range ("11" when single-line, else "11-15"). */
export function lineLabel(f: Pick<FindingRecord, "start_line" | "end_line">): string {
  return f.start_line === f.end_line ? `${f.start_line}` : `${f.start_line}-${f.end_line}`;
}

/** Non-zero severity counts, in display order (most severe first). */
export function nonZeroCounts(
  counts: SeverityCounts,
): { severity: "CRITICAL" | "WARNING" | "SUGGESTION"; count: number }[] {
  return (
    [
      { severity: "CRITICAL" as const, count: counts.critical },
      { severity: "WARNING" as const, count: counts.warning },
      { severity: "SUGGESTION" as const, count: counts.suggestion },
    ] satisfies { severity: "CRITICAL" | "WARNING" | "SUGGESTION"; count: number }[]
  ).filter((c) => c.count > 0);
}

/** Tally a finding list into per-severity counts. */
export function tallyBySeverity(findings: FindingRecord[]): SeverityCounts {
  const counts: SeverityCounts = { critical: 0, warning: 0, suggestion: 0 };
  for (const f of findings) {
    if (f.severity === "CRITICAL") counts.critical++;
    else if (f.severity === "WARNING") counts.warning++;
    else if (f.severity === "SUGGESTION") counts.suggestion++;
  }
  return counts;
}

/** Sort findings by severity (most severe first) for the popover list. */
export function sortBySeverity(findings: FindingRecord[]): FindingRecord[] {
  return findings
    .slice()
    .sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 99) - (SEVERITY_ORDER[b.severity] ?? 99));
}
