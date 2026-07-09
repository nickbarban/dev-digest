/* FindingsHoverBadges — compact per-severity finding badges with a hover
   popover listing individual findings. Shared between the PR list page
   (counts known upfront, findings lazy-fetched on hover) and the PR detail
   Timeline (counts + findings both already in hand, no fetch needed). */
"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { SeverityBadge, CategoryTag, MonoLink, ConfidenceNum, type Severity, type Category } from "@devdigest/ui";
import type { FindingRecord } from "@devdigest/shared";
import { nonZeroCounts, sortBySeverity, lineLabel, type SeverityCounts } from "./helpers";
import { githubBlobUrl } from "@/lib/github-urls";
import { s } from "./styles";

export function FindingsHoverBadges({
  counts,
  findings,
  loading = false,
  repoFullName,
  headSha,
  onHoverChange,
}: {
  counts: SeverityCounts;
  /** Popover body; undefined/[] while `loading` (list page) or simply empty. */
  findings: FindingRecord[] | undefined;
  /** True only while the list page lazily fetches findings on hover. */
  loading?: boolean;
  repoFullName?: string | null;
  headSha?: string | null;
  /** Fired on hover enter/leave — lets a lazy-loading caller (the PR list) trigger its fetch. */
  onHoverChange?: (hovered: boolean) => void;
}) {
  const t = useTranslations("prReview");
  const [hovered, setHovered] = React.useState(false);
  const nonZero = nonZeroCounts(counts);
  const total = nonZero.reduce((sum, c) => sum + c.count, 0);
  const sorted = React.useMemo(() => sortBySeverity(findings ?? []), [findings]);

  if (total === 0) {
    return <span style={{ color: "var(--text-muted)" }}>—</span>;
  }

  const setHoveredAndNotify = (v: boolean) => {
    setHovered(v);
    onHoverChange?.(v);
  };

  return (
    <div style={s.wrap} onMouseEnter={() => setHoveredAndNotify(true)} onMouseLeave={() => setHoveredAndNotify(false)}>
      <div style={s.badges}>
        {nonZero.map((c) => (
          <SeverityBadge key={c.severity} severity={c.severity as Severity} count={c.count} compact />
        ))}
      </div>

      {hovered && (
        <div style={s.panel}>
          <div style={s.panelTitle}>{t("list.findingsPopover.title", { count: total })}</div>
          {loading ? (
            <div style={s.loading}>{t("list.findingsPopover.loading")}</div>
          ) : (
            sorted.map((f) => {
              const fileHref =
                repoFullName && headSha
                  ? githubBlobUrl(repoFullName, headSha, f.file, f.start_line, f.end_line)
                  : undefined;
              return (
                <div key={f.id} style={s.findingRow}>
                  <div style={s.findingTitleRow}>
                    <SeverityBadge severity={f.severity as Severity} compact />
                    <span style={s.findingTitle}>{f.title}</span>
                    <CategoryTag category={f.category as Category} />
                  </div>
                  <div style={s.metaRow}>
                    <MonoLink href={fileHref}>
                      {f.file}:{lineLabel(f)}
                    </MonoLink>
                    <ConfidenceNum value={f.confidence} />
                  </div>
                  <p style={s.rationale}>{f.rationale}</p>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default FindingsHoverBadges;
