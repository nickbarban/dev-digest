import type { RunSummary, PrCommit } from "@devdigest/shared";
import type { IconName } from "@devdigest/ui";

/** Derived review-outcome badge: color + bg tokens + icon, keyed by `runStatus.<key>`. */
export type Outcome = { key: string; color: string; bg: string; icon: IconName };

/** A run or a commit, merged into one chronological feed. */
export type TimelineItem =
  | { kind: "run"; ts: number; run: RunSummary }
  | { kind: "commit"; ts: number; commit: PrCommit };
