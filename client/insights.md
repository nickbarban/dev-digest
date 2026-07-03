# client/ — insights

Only record facts that cannot be inferred from code: pitfalls, non-obvious decisions,
odd behavior discovered during work. Re-read before adding entries to avoid duplication.

## What Works

## What Doesn't Work

## Codebase Patterns

- 2026-07-02 — PR list table columns are driven by TWO separate constants that must stay in sync: `GRID` (CSS grid template) and `COLUMN_KEYS` (header labels array). Adding a column without updating both breaks the layout silently — cells shift out of alignment. (`client/src/app/repos/[repoId]/pulls/constants.ts`)
- 2026-07-02 — The header row uses `s.headCell(i === COLUMN_KEYS.length - 1)` to right-align only the last column. When adding a second right-aligned column before it, change the condition to `i >= COLUMN_KEYS.length - 2` (or key-based check). (`client/src/app/repos/[repoId]/pulls/page.tsx:101`)

## Tool & Library Notes

## Recurring Errors & Fixes

- 2026-07-02 — Adding a non-optional field to `RunSummary` contract causes TS2719 in test files. Fix: add the new field (e.g. `cost_usd: null`) to the base object in the test factory function. (`RunHistory.test.tsx:33`)

## Session Notes

## Open Questions
