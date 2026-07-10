# server/ — insights

Only record facts that cannot be inferred from code: pitfalls, non-obvious decisions,
odd behavior discovered during work. Re-read before adding entries to avoid duplication.

## What Works

## What Doesn't Work

## Codebase Patterns

- 2026-07-02 — PR list enrichment follows a fixed pattern: collect `prIds`, run separate aggregate queries, join in JS via `Map`. Any new per-PR data (cost, badge counts, etc.) must follow this pattern in `server/src/modules/pulls/routes.ts`, not a JOIN on the main query.
- 2026-07-02 — Adding a field to `ReviewOutcome` (in `reviewer-core`) does NOT automatically surface it anywhere. You must manually: (1) destructure it in `run-executor.ts:213`, (2) pass it to `completeAgentRun()`, (3) include it in `RunTrace.stats`. `costUsd` was computed for months but silently discarded because step 1 was missing.
- 2026-07-07 — Unlike `agentRuns`/`reviews` (both have a direct `prId` column), `findings` only has `reviewId` — no `pr_id`. Per-PR findings aggregation needs an extra join through `reviews` (`findings.reviewId -> reviews.id -> reviews.prId`), not a direct `inArray(prId, ...)` like the score/cost aggregations use. (`server/src/modules/pulls/routes.ts`, `server/src/db/schema/reviews.ts`)

## Tool & Library Notes

- 2026-07-02 — Drizzle `sum()` returns `string | null`, not `number | null`. Always wrap with `Number(row.total)` before storing or comparing. (`server/src/modules/pulls/routes.ts`)
- 2026-07-02 — New fields added to `RunStats` (stored as JSONB in `run_traces.trace`) must use `.nullish()`, not `.nullable()`. Old trace documents simply won't have the field — `.nullable()` alone causes a Zod validation failure on read because the value is `undefined`, not `null`. (`server/src/vendor/shared/contracts/trace.ts`)

## Recurring Errors & Fixes

- 2026-07-08 — Seed PR #482's sample review (`db/seed.ts`, `model: 'seed'`) was originally created with no `agent_id`/`run_id` ("so the PR shows results before the first run"). That meant its findings only ever showed in "Review Runs", never in the Timeline (which lists `agent_runs`, not `reviews`) — looked like a Timeline rendering bug but was a seed-data gap. Fixed by backfilling a synthetic `agent_runs` row + `reviews.run_id`/`agent_id` (attached to "Security Reviewer"), idempotently, outside the `if (!pr)` guard so it also patches already-seeded DBs on `pnpm db:seed` re-run.

## Session Notes

- 2026-07-02 — Implemented Run Cost Badge (Task 3): added `cost_usd` column to `agent_runs`, wired costUsd from ReviewOutcome through executor→repo→RunTrace, added SUM aggregate to PR list, created RunCostBadge component, surfaced cost in three UI locations (PR list, RunHistory timeline, TraceBody stats).

## Open Questions
