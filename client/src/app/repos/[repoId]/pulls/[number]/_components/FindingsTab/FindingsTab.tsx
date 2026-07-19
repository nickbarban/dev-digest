"use client";

import React, { useCallback } from "react";
import { useTranslations } from "next-intl";
import { Icon, Badge, Button, SectionLabel, EmptyState, type Severity } from "@devdigest/ui";
import { RunStatus } from "../RunStatus";
import { RunHistory } from "../RunHistory";
import { ReviewRunAccordion } from "../ReviewRunAccordion";
import { SeverityFilterBar } from "../SeverityFilterBar";
import { s } from "./styles";
import type { FindingRecord, ReviewRecord, RunSummary, PrCommit } from "@devdigest/shared";
import type { UseMutationResult } from "@tanstack/react-query";

interface FindingsTabProps {
  prId: string | null;
  liveRunIds: string[];
  reviewRunning: boolean;
  lethalTrifecta: FindingRecord[];
  runs: ReviewRecord[];
  prRuns: RunSummary[] | undefined;
  prCommits: PrCommit[];
  cancelMutation: UseMutationResult<any, any, string, any>;
  /** owner/repo + head sha — used to deep-link a finding's file:line to GitHub. */
  repoFullName?: string | null;
  headSha?: string | null;
  onOpenTrace: (id: string) => void;
  onDelete: (id: string) => void;
  onRunDone: () => void;
}

export function FindingsTab({
  prId,
  liveRunIds,
  reviewRunning,
  lethalTrifecta,
  runs,
  prRuns,
  prCommits,
  cancelMutation,
  repoFullName,
  headSha,
  onOpenTrace,
  onDelete,
  onRunDone,
}: FindingsTabProps) {
  const t = useTranslations("prReview");
  const handleCancelAll = useCallback(() => {
    liveRunIds.forEach((id) => cancelMutation.mutate(id));
  }, [liveRunIds, cancelMutation]);

  const handleOpenFirstTrace = useCallback(() => {
    if (liveRunIds[0]) onOpenTrace(liveRunIds[0]);
  }, [liveRunIds, onOpenTrace]);

  // Timeline → Review-runs navigation: clicking an agent name in the timeline
  // opens + scrolls to that run's accordion below. The nonce re-triggers the
  // scroll even when the same run is clicked twice.
  const [target, setTarget] = React.useState<{ runId: string; n: number } | null>(null);
  const handleGoToReview = useCallback((runId: string) => {
    setTarget((p) => ({ runId, n: (p?.n ?? 0) + 1 }));
  }, []);

  // Severity filter across all runs: clicking a severity narrows "Review
  // runs" down to just its findings; clicking the active one again clears it.
  const [activeSeverity, setActiveSeverity] = React.useState<Severity | null>(null);
  const handleToggleSeverity = useCallback((sev: Severity) => {
    setActiveSeverity((prev) => (prev === sev ? null : sev));
  }, []);
  const allFindings = React.useMemo(() => runs.flatMap((r) => r.findings), [runs]);
  const findingsByRunId = React.useMemo(
    () => new Map(runs.filter((r) => r.run_id).map((r) => [r.run_id as string, r.findings])),
    [runs],
  );
  const visibleRuns = React.useMemo(
    () =>
      activeSeverity
        ? runs.filter((r) => r.findings.some((f) => f.severity === activeSeverity))
        : runs,
    [runs, activeSeverity],
  );

  return (
    <section>
      {liveRunIds.length > 0 && (
        <div style={s.liveRunSection}>
          <SectionLabel
            icon="Sparkles"
            right={
              <div style={s.cancelActions}>
                <Button
                  kind="danger"
                  size="sm"
                  icon="X"
                  loading={cancelMutation.isPending}
                  onClick={handleCancelAll}
                >
                  {t("findingsTab.cancel")}
                </Button>
                <Button kind="ghost" size="sm" icon="FileText" onClick={handleOpenFirstTrace}>
                  {t("findingsTab.openRunTrace")}
                </Button>
              </div>
            }
          >
            {t("findingsTab.liveReview")}
          </SectionLabel>
          <RunStatus runIds={liveRunIds} onDone={onRunDone} />
        </div>
      )}

      {reviewRunning && (
        <div style={s.reviewInProgress}>
          <Icon.RefreshCw size={16} style={{ color: "var(--accent)", animation: "ddspin 1s linear infinite" }} />
          <span style={s.reviewInProgressText}>{t("findingsTab.reviewInProgress")}</span>
          <span style={s.reviewInProgressSub}>{t("findingsTab.reviewInProgressSub")}</span>
        </div>
      )}

      {lethalTrifecta.length > 0 && (
        <div style={s.lethalTrifecta}>
          <Icon.Shield size={16} style={{ color: "var(--crit)" }} />
          <span style={s.lethalTrifectaTitle}>{t("findingsTab.lethalTrifectaDetected")}</span>
          <Badge color="var(--crit)" bg="transparent">
            {t("runStatus.findings", { count: lethalTrifecta.length })}
          </Badge>
        </div>
      )}

      {((prRuns && prRuns.length > 0) || prCommits.length > 0) && (
        <div style={s.timelineSection}>
          <SectionLabel
            icon="Activity"
            right={<span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("findingsTab.timelineSubtitle")}</span>}
          >
            {t("findingsTab.timeline")}
          </SectionLabel>
          <RunHistory
            runs={prRuns ?? []}
            commits={prCommits}
            findingsByRunId={findingsByRunId}
            repoFullName={repoFullName}
            headSha={headSha}
            onOpenTrace={onOpenTrace}
            onGoToReview={handleGoToReview}
            onDelete={onDelete}
          />
        </div>
      )}

      <SectionLabel
        icon="AlertOctagon"
        right={<span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t("findingsTab.reviewRunsSubtitle")}</span>}
      >
        {t("findingsTab.reviewRuns")}
      </SectionLabel>
      {runs.length > 0 && (
        <SeverityFilterBar
          findings={allFindings}
          active={activeSeverity}
          onToggle={handleToggleSeverity}
        />
      )}
      {runs.length === 0 ? (
        reviewRunning || liveRunIds.length > 0 ? null : (
          <EmptyState
            icon="Sparkles"
            title={t("findingsTab.emptyTitle")}
            body={t("findingsTab.emptyBody")}
          />
        )
      ) : visibleRuns.length === 0 ? (
        <EmptyState
          icon="Filter"
          title={t("findingsTab.noSeverityFindingsTitle", { severity: activeSeverity?.toLowerCase() ?? "" })}
          body={t("findingsTab.noSeverityFindingsBody")}
        />
      ) : (
        prId &&
        visibleRuns.map((review, i) => (
          <ReviewRunAccordion
            key={review.id}
            review={review}
            prId={prId}
            defaultOpen={i === 0}
            repoFullName={repoFullName}
            headSha={headSha}
            targetRunId={target?.runId ?? null}
            targetNonce={target?.n ?? 0}
            severityFilter={activeSeverity}
          />
        ))
      )}
    </section>
  );
}
