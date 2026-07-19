import type { CSSProperties } from "react";

const style: CSSProperties = { color: "var(--text-muted)", fontSize: 12 };

export function formatCost(value: number | null | undefined): string {
  if (value == null) return "—";
  // Strip trailing zeros after up to 3 decimal places: 0.060 → "$0.06", 0.014 → "$0.014"
  return "$" + value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

/** Renders cost as "$0.014" or "—" when null/undefined. */
export function RunCostBadge({ value }: { value: number | null | undefined }) {
  return <span style={style}>{formatCost(value)}</span>;
}
