/* FindingsCell — per-severity finding badges for one PR list row. Hovering
   lazy-loads the PR's full review/finding detail (same endpoint + cache the
   PR detail page uses); rendering itself is shared with the PR detail
   Timeline via FindingsHoverBadges. */
"use client";

import React from "react";
import type { PrMeta } from "@/lib/types";
import { usePrReviews } from "@/lib/hooks/reviews";
import { useActiveRepo } from "@/lib/repo-context";
import { FindingsHoverBadges } from "@/components/FindingsHoverBadges";

export function FindingsCell({ pr }: { pr: PrMeta }) {
  const { activeRepo } = useActiveRepo();
  const [hovered, setHovered] = React.useState(false);

  const { data: reviews, isLoading } = usePrReviews(hovered ? (pr.id ?? null) : null);
  const findings = React.useMemo(() => (reviews ?? []).flatMap((r) => r.findings), [reviews]);

  return (
    <FindingsHoverBadges
      counts={{
        critical: pr.findings_critical ?? 0,
        warning: pr.findings_warning ?? 0,
        suggestion: pr.findings_suggestion ?? 0,
      }}
      findings={findings}
      loading={hovered && isLoading}
      repoFullName={activeRepo?.full_name}
      headSha={pr.head_sha}
      onHoverChange={setHovered}
    />
  );
}

export default FindingsCell;
