/* SeverityFilterBar — per-severity finding counts across all runs for this PR.
   Clicking a severity filters the "Review runs" list below to just that
   severity; clicking the active one again clears the filter. */
"use client";

import React from "react";
import { Chip, SEV, type Severity } from "@devdigest/ui";
import type { FindingRecord } from "@devdigest/shared";
import { s } from "./styles";

const SEVERITIES: Severity[] = ["CRITICAL", "WARNING", "SUGGESTION"];

export function SeverityFilterBar({
  findings,
  active,
  onToggle,
}: {
  findings: FindingRecord[];
  active: Severity | null;
  onToggle: (severity: Severity) => void;
}) {
  const counts = React.useMemo(() => {
    const c: Record<Severity, number> = { CRITICAL: 0, WARNING: 0, SUGGESTION: 0, INFO: 0 };
    for (const f of findings) c[f.severity as Severity]++;
    return c;
  }, [findings]);

  return (
    <div style={s.bar}>
      {SEVERITIES.map((sev) => (
        <Chip
          key={sev}
          icon={SEV[sev].icon}
          color={SEV[sev].c}
          count={counts[sev]}
          active={active === sev}
          onClick={() => onToggle(sev)}
        >
          {SEV[sev].label.toUpperCase()}
        </Chip>
      ))}
    </div>
  );
}

export default SeverityFilterBar;
