"use client";

import { useTranslations } from "next-intl";
import { Badge, Icon, CircularScore } from "@devdigest/ui";
import type { RunSummary, PrCommit, FindingRecord } from "@devdigest/shared";
import { RunCostBadge } from "@/components/run-cost-badge";
import { FindingsHoverBadges, tallyBySeverity } from "@/components/findings-hover-badges";
import type { TimelineItem } from "./constants";
import { outcomeOf, tsOf } from "./helpers";
import { s } from "./styles";

/**
 * PR timeline — every agent run interleaved with the PR's commits, newest-first
 * and DB-backed so it survives reload. Showing commits between runs makes it
 * clear which commit each review ran against. Failed runs show their error
 * inline; clicking a run row opens its trace.
 */
export function RunHistory({
  runs,
  commits = [],
  findingsByRunId,
  repoFullName,
  headSha,
  onOpenTrace,
  onGoToReview,
  onDelete,
}: {
  runs: RunSummary[];
  commits?: PrCommit[];
  /** This run's individual findings, keyed by run_id — powers the severity badges + hover popover. */
  findingsByRunId?: Map<string, FindingRecord[]>;
  repoFullName?: string | null;
  headSha?: string | null;
  /** Open the trace + log drawer for a run (the logs icon). */
  onOpenTrace: (runId: string) => void;
  /** Jump to this run's inline review accordion below (clicking the agent name). */
  onGoToReview?: (runId: string) => void;
  onDelete?: (runId: string) => void;
}) {
  const t = useTranslations("prReview");
  if (runs.length === 0 && commits.length === 0) return null;

  const items: TimelineItem[] = [
    ...runs.map((run) => ({ kind: "run" as const, ts: tsOf(run.ran_at), run })),
    ...commits.map((commit) => ({
      kind: "commit" as const,
      ts: tsOf(commit.committed_at),
      commit,
    })),
  ].sort((a, b) => b.ts - a.ts);

  return (
    <div style={s.wrap}>
      {items.map((item) => {
        if (item.kind === "commit") {
          const c = item.commit;
          return (
            <div key={`commit:${c.sha}`} style={s.commitRow}>
              <Icon.GitCommit size={15} style={s.commitIcon} />
              <span className="mono" style={s.commitSha}>
                {c.sha.slice(0, 7)}
              </span>
              <span style={s.commitMessage} title={c.message}>
                {c.message.split("\n")[0]}
              </span>
              <span style={s.commitMeta}>{c.author}</span>
              {c.committed_at && <span style={s.commitMeta}>{new Date(c.committed_at).toLocaleTimeString()}</span>}
            </div>
          );
        }

        const r = item.run;
        const o = outcomeOf(r);
        const settled = r.status === "done";
        return (
          <div key={`run:${r.run_id}`} style={s.row}>
            <Badge color={o.color} bg={o.bg} icon={o.icon}>
              {t(`runStatus.${o.key}`)}
            </Badge>
            {settled && r.score != null && <CircularScore score={r.score} size={30} stroke={3} />}
            <div style={s.nameCol}>
              <div style={s.nameLine}>
                <button
                  type="button"
                  onClick={() => onGoToReview?.(r.run_id)}
                  title={t("timeline.goToReview")}
                  style={s.agentNameBtn(!!onGoToReview)}
                >
                  {r.agent_name ?? "Agent"}
                </button>{" "}
                <span className="mono" style={s.agentMeta}>
                  {r.provider}/{r.model}
                </span>
              </div>
              {r.status === "failed" && r.error && (
                <div style={s.errorText} title={r.error}>
                  {r.error}
                </div>
              )}
              {settled && (
                <div style={s.findingsRow}>
                  <FindingsHoverBadges
                    counts={tallyBySeverity(findingsByRunId?.get(r.run_id) ?? [])}
                    findings={findingsByRunId?.get(r.run_id) ?? []}
                    repoFullName={repoFullName}
                    headSha={headSha}
                  />
                  {(r.blockers ?? 0) > 0 ? t("runStatus.blockers", { count: r.blockers ?? 0 }) : ""}
                </div>
              )}
            </div>
            <div style={s.rightCol}>
              {r.cost_usd != null && <RunCostBadge value={r.cost_usd} />}
              {r.ran_at && <span>{new Date(r.ran_at).toLocaleTimeString()}</span>}
            </div>
            <button
              type="button"
              title={t("timeline.openTrace")}
              aria-label={t("timeline.openTrace")}
              onClick={() => onOpenTrace(r.run_id)}
              style={s.iconBtn}
            >
              <Icon.FileText size={13} />
            </button>
            {onDelete && r.status !== "running" && (
              <span
                role="button"
                aria-label={t("timeline.deleteRun")}
                title={t("timeline.deleteRun")}
                onClick={() => onDelete(r.run_id)}
                style={s.deleteBtn}
              >
                <Icon.Trash size={13} />
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
