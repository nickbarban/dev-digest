---
name: engineering-insights
description: "Captures non-obvious engineering learnings from the current session into the active module's insights.md. Invoke proactively when discovering: a pitfall not described in README or CLAUDE.md, a non-obvious architectural decision, a library quirk that costs time, a module-specific pattern that only works for non-obvious reasons, or a recurring error with its fix. Also invoke at session end to review and append missing entries. Target modules: server/, client/, reviewer-core/, e2e/."
metadata:
  tags: learnings, insights, session-notes, pitfalls, knowledge-capture
---

## When to use

Invoke when you discover:
- A pitfall not already in the module's README, CLAUDE.md, or gotchas
- A non-obvious decision whose "why" won't survive a code read
- A library quirk that burned time or would surprise a competent reader
- A module-specific pattern that only works here for non-obvious reasons
- A recurring error with its exact fix

Skip if: discovery is obvious from reading the code; already in README/CLAUDE.md; one-off situation unlikely to recur.

## Session start (mandatory)

Before the first reply in any session:
1. Read the relevant doc or slide for the current topic
2. Read `{module}/insights.md` in full — treat contents as high-confidence guidance
3. Confirm you have read it before proceeding

## Module detection

| Files being edited | Write to |
|--------------------|----------|
| `server/` | `server/insights.md` |
| `client/` | `client/insights.md` |
| `reviewer-core/` | `reviewer-core/insights.md` |
| `e2e/` | `e2e/insights.md` |

If multiple modules are touched, write to each relevant file.

## Execution flow (every invocation — proactive or manual)

1. **Read** `{module}/insights.md` in full — do this FIRST, always
2. **Understand** what is already recorded there
3. **Evaluate** the potential new finding:
   - Is it already in insights.md? → stop, do not duplicate
   - Is it already in the module's README or CLAUDE.md? → stop
   - Would it be obvious from reading the code? → stop
4. **Append** only if the finding passes all three checks

## Append-only rule (unconditional)

NEVER overwrite, rewrite, or delete any existing content in `insights.md`.
NEVER regenerate or reformat existing entries.
ONLY append new bullet points at the bottom of the relevant section.
If an entry already says what you wanted to add — do nothing.

## Entry format

```
- YYYY-MM-DD — insight text. (`path/to/file.ts:line` if applicable)
```

Place under the section that best matches. Keep to one line where possible.

**Good:** `- 2026-07-01 — groundFindings() runs after EVERY strategy unconditionally, even score=0; skipping it corrupts ReviewOutcome. (reviewer-core/src/grounding.ts:42)`

**Bad (skip):** `- 2026-07-01 — Be careful with async code` — vague, non-actionable, not project-specific

## Quality gate

Before writing, ask: **"Would this save 5+ minutes next time, and would it NOT be obvious from reading the code?"**
- Both yes → write it
- Either no → skip it

## Sections

- **What Works** — approaches, patterns, solutions that proved effective
- **What Doesn't Work** — failed approaches, dead ends, antipatterns to avoid
- **Codebase Patterns** — non-obvious project conventions, architecture constraints
- **Tool & Library Notes** — quirks, gotchas, or behaviors of dependencies
- **Recurring Errors & Fixes** — errors that recur with exact fix
- **Session Notes** — one datestamped summary per session of what was accomplished
- **Open Questions** — things left unresolved or needing more investigation

## Session end (mandatory)

At the end of any session where you worked in a module:
1. Re-read the current `{module}/insights.md` in full
2. Compare against what happened this session
3. If something substantive is missing AND not obvious from code → append it
4. If nothing new and substantive → write nothing; do not add noise

> ~80–100 entries signals the file needs a consolidation pass (prune stale, merge duplicates).
