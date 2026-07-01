# reviewer-core/ — @devdigest/reviewer-core

Pure review engine: diff → prompt → LLM → grounded findings.

## Commands
```sh
pnpm test     # vitest with MockLLMProvider — no real LLM call
pnpm build    # typecheck only; no JS emitted
```

## Critical constraints
- **No DB, GitHub, or filesystem** — the only side effect is the injected `LLMProvider`
- **No JS build** — consumed via tsconfig path alias directly as TypeScript
- **Grounding gate is mandatory and unconditional** — `groundFindings()` runs
  after EVERY strategy; never skip it
- **Score is computed from findings that passed the gate** — do not trust the model's number;
  authority is `scoreFromFindings(ground.kept)`

## Pipeline
`assemblePrompt()` → LLM call(s) → `reduceReviews()` → `groundFindings()` → `ReviewOutcome`

## Non-default conventions
- All untrusted content (prDescription, specs, repoMap) goes through `wrapUntrusted()`
- map-reduce triggers only when diff > 400 lines AND > 1 file (both conditions)
- `ReviewInput` slots (skills, memory, specs, callers) — resolved strings; caller
  resolves slugs → bodies BEFORE calling the engine

## Read when
- Full pipeline diagram → [README.md](README.md)
- Prompt assembly or injection hardening → [README.md](README.md)
- Adding a new prompt slot → [docs/](docs/)
- Design decisions not visible from code → [insights.md](insights.md)
