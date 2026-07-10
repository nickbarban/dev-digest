# reviewer-core/ — insights

Only record facts that cannot be inferred from code: pitfalls, non-obvious decisions,
odd behavior discovered during work. Re-read before adding entries to avoid duplication.

## What Works

## What Doesn't Work

## Codebase Patterns

## Tool & Library Notes

- 2026-07-08 — The `openai` SDK's own `timeout` client option is NOT reliably honored when OpenRouter's response body stalls mid-stream — observed a `chat.completions.create()` call hang ~25 minutes (`1494425ms`) before failing with `Socket timeout`, despite `timeout: 90_000` configured. Fixed by wrapping the call in an explicit `Promise.race`-based hard timeout (`withTimeout` in `src/llm/resilience.ts`), sized to `(maxRetries+1) * timeoutMs + buffer` so it doesn't cut off the SDK's own legitimate internal retries. (`reviewer-core/src/llm/openrouter.ts`)

## Recurring Errors & Fixes

## Session Notes

## Open Questions
