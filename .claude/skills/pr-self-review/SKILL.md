---
name: pr-self-review
description: "Runs the project's frontend and backend best-practice skills, plus a correctness pass, against the current diff before opening a PR. Use before running `gh pr create`, or any time you want a local self-review of uncommitted/unpushed changes. A PreToolUse hook blocks `gh pr create` until this has run clean for the current diff. Accepts an optional `--override \"reason\"` to consciously bypass a block."
---

# PR Self-Review

Local, pre-flight review that dispatches this repo's existing best-practice skills against
the current diff, aggregates their findings, and gates on CRITICAL. It does not duplicate any
sub-skill's rules — it only classifies changed files, dispatches the right skills at them, and
enforces the result.

## Relationship to Other Skills

This skill owns *dispatch and gating*, not the rules themselves. It runs, unmodified:

- Frontend: [react-ui-architecture](../react-ui-architecture/SKILL.md), [react-best-practices](../react-best-practices/SKILL.md), [next-best-practices](../next-best-practices/SKILL.md), [react-testing-library](../react-testing-library/SKILL.md)
- Backend: [onion-architecture](../onion-architecture/SKILL.md), [fastify-best-practices](../fastify-best-practices/SKILL.md), [drizzle-orm-patterns](../drizzle-orm-patterns/SKILL.md), [postgresql-table-design](../postgresql-table-design/SKILL.md)
- Both: [zod](../zod/SKILL.md), [typescript-expert](../typescript-expert/SKILL.md), [security](../security/SKILL.md)
- Correctness (not an architecture skill): the built-in `code-review` skill, for actual bugs and
  reuse/simplification issues nothing in the table above covers

## Severity Levels

Reused verbatim from `security`/`onion-architecture`/`react-best-practices` — don't invent a
parallel scale:

- **CRITICAL** — Will cause bugs, broken reconciliation, or maintenance nightmares
- **HIGH** — Will cause performance issues or scaling problems
- **MEDIUM** — Will hurt maintainability or developer experience
- **LOW** — Defense-in-depth / stylistic; worth a mention, never a blocker

---

## Workflow

### 1. Resolve diff scope and changed files

Run:
```
.claude/skills/pr-self-review/scripts/changed-files.sh [base-branch]
```
This lists every changed file (`<status>\t<path>`, renames as `R100\told\tnew`) across
committed-ahead-of-base + working tree + untracked, using the same diff scope every other
script in this skill uses. Omit `base-branch` unless the target PR's `--base` is known to differ
from the branch's tracking upstream / `origin/main`.

For the actual diff hunks (needed later, per matched skill), use:
```
.claude/skills/pr-self-review/scripts/collect-diff.sh [base-branch]
```
Don't hand-roll `git diff` — these scripts are the single source of truth for what "the reviewed
diff" means, and the receipt hash (step 6) is computed from the exact same scope.

If `changed-files.sh` prints nothing, skip straight to step 6 and write a `pass` receipt — no
skills need to run.

### 2. Classify files into buckets

Using `AGENTS.md`'s folder map:
- **Frontend**: `client/**`
- **Backend**: `server/**`, `reviewer-core/**`
- **Out of scope for dispatch** (report only, no skill runs): `e2e/**`, docs, config
- Deleted files (`D` status): list in the report, don't dispatch — nothing to read
- Renamed files (`R###` status): review at the new path; note the old path for context

### 3. Match files against the skill map

| Bucket | Trigger (any matching changed file) | Skills to dispatch |
|---|---|---|
| Frontend | `client/**/*.tsx`, `client/**/*.ts` | `react-ui-architecture`, `react-best-practices` |
| Frontend | `client/src/app/**` | `next-best-practices` |
| Frontend | `client/**/*.test.tsx` | `react-testing-library` |
| Backend | `server/**`, `reviewer-core/**` | `onion-architecture` |
| Backend | `server/src/**/routes.ts`, `server.ts`, `app.ts` | `fastify-best-practices` |
| Backend | `server/src/db/schema/**`, `**/migrations/**` | `drizzle-orm-patterns`, `postgresql-table-design` |
| Both | any file defining/using `z.object` etc. | `zod` |
| Both | any `.ts`/`.tsx` changed | `typescript-expert` |
| Both | auth, input handling, file upload, secrets, API routes | `security` |
| Both | *(always, if any files changed)* | built-in `code-review` (correctness track) |

Build the list of `(skill, matched files)` pairs with a non-empty match. Only `code-review`
always runs; everything else is conditional on the trigger actually matching a changed file.

### 4. Check the per-file cache before dispatching

Before spawning a subagent for a `(skill, file)` pair, hash the file's current content with
`git hash-object <path>` and look it up in `.claude/.pr-self-review-cache.json` (create as `{}`
if absent). If a cached entry exists for that exact `(skill, fileHash)` pair, reuse its findings
instead of re-dispatching — this is what makes repeated iterate-fix-rerun cycles cheap. After
this run, write back the merged cache: keep hits that were reused, add newly computed entries,
and drop entries for files no longer in the diff.

### 5. Dispatch

For each `(skill, matched files)` pair that isn't fully cache-hit, spawn one subagent in
parallel (single message, multiple Agent tool calls — do not dispatch sequentially). Each
subagent prompt must include:
- The skill name and an instruction to load it via the `Skill` tool (or, if that's not
  invokable from within a subagent, the target `SKILL.md`'s content pasted inline)
- The list of matched files for that skill specifically (not the whole diff)
- The actual diff hunks for those files, from `collect-diff.sh` — subagents don't share this
  conversation's context, so file names alone aren't enough
- A fixed return shape: `{skill, file, line, severity, summary, why}` per finding — no prose,
  no markdown report, just that structure so aggregation (step 7) doesn't need to re-parse
  free text

The `code-review` correctness track is dispatched the same way, at `--effort medium` (or `high`
for a small diff), against the full diff rather than a per-skill file subset.

### 6. Verification pass on CRITICAL findings

Before any finding is allowed to gate the PR, re-examine every CRITICAL-tagged finding against
the actual current file content (a second subagent turn, or do it inline if the finding count is
small) and tag it `CONFIRMED` or `PLAUSIBLE` — mirroring how the built-in `code-review` skill's
own verify step works. Only `CONFIRMED` CRITICALs are allowed to block. `PLAUSIBLE` CRITICALs
still show in the report, clearly marked unconfirmed, but don't by themselves flip the gate.
This step exists specifically so architecture-rule subagents over-flagging doesn't train people
to stop trusting (and start bypassing) the gate.

### 7. Aggregate and report

Collect every subagent's findings plus the correctness track. Dedupe: if the same file:line is
flagged by more than one skill, collapse into one entry listing all contributing skills instead
of repeating it. Sort CRITICAL → LOW. Render one scannable report grouped by file, each finding
showing its severity badge and (for CRITICALs) confirmation status.

### 8. Gate and write the receipt

This is the **only** step allowed to call `write-receipt.sh` — every other step just computes.

- If any `CONFIRMED` CRITICAL exists → print `BLOCKED — do not open a PR` listing every
  confirmed CRITICAL with file:line, then run:
  ```
  .claude/skills/pr-self-review/scripts/write-receipt.sh blocked [base-branch]
  ```
- Otherwise → print `PASS` (still surface `PLAUSIBLE` CRITICALs and lower-severity findings for
  awareness, just don't call them blockers), then run:
  ```
  .claude/skills/pr-self-review/scripts/write-receipt.sh pass [base-branch]
  ```

`base-branch` must be the exact same value (or omission) used in step 1 — the receipt's hash and
base must match what the PreToolUse hook (`gate.sh`) will recompute, or it treats the receipt as
stale even on a clean pass.

### Override escape hatch

If invoked as `/pr-self-review --override "<reason>"` after a prior `BLOCKED` verdict: don't
re-run the full dispatch — just record the conscious override:
```
.claude/skills/pr-self-review/scripts/write-receipt.sh override [base-branch] "<reason>"
```
This lets `gh pr create` through (the hook shows the recorded reason as a reminder), but the
reason is permanently in the receipt rather than silently becoming a `pass` — echo it into the
PR description too, so the override stays visible on the PR itself, not just locally.

---

## The PreToolUse hook (already wired)

`.claude/skills/pr-self-review/scripts/gate.sh` runs before every `Bash` tool call (see
`.claude/settings.json`). It only acts on `gh pr create` commands:
- `--draft` → always allowed through (not yet mergeable, gate re-applies once undrafted)
- No receipt, or receipt hash/base doesn't match the current diff → denied, told to run this
  skill
- Receipt `verdict: "blocked"` → denied
- Receipt `verdict: "pass"` or `"override"` and fresh → allowed

The hook can't invoke this skill itself (hooks are deterministic scripts, not LLM turns) — it
can only check whether the skill already ran and left a fresh receipt. If you see a deny message
from `gh pr create`, that's your cue to run `/pr-self-review` (or `--override` if the block is a
conscious call), not to route around the hook.
