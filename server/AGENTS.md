# server/ — @devdigest/api

Fastify 5 + Drizzle ORM + Postgres (pgvector).

## Commands
```sh
pnpm dev                                            # :3001
pnpm db:migrate                                     # apply migrations
pnpm db:seed                                        # idempotent demo data
pnpm exec vitest run --exclude '**/*.it.test.ts'    # unit (no Docker)
pnpm exec vitest run .it.test                       # integration (Docker required)
```

## Where things live
- `src/modules/<name>/` — feature slice: routes + service + repository
- `src/adapters/` — ports: llm, github, git, astgrep, embedder, secrets
- `src/db/schema/` — Drizzle schema (all course tables are here; empty ones = stubs for future lessons)
- `src/platform/` — DI container, config, error handler
- `src/vendor/shared/` — vendored copy of `@devdigest/shared`

## Non-default conventions
- Route schema = Zod via `fastify-type-provider-zod` — one schema controls
  request validation AND response serialization
- `*.it.test.ts` = integration (real Postgres via testcontainers);
  everything else = hermetic unit
- SSE on `POST /runs` via `fastify-sse-v2` — events: `tool | result | info`
- `run-executor.ts` — single review orchestration point: calls `reviewer-core`,
  persists findings, streams SSE; do not duplicate logic in routes or service

## Gotchas
- Rate limit: 120/min globally, stricter on `/pulls/:id/review`; disabled when `NODE_ENV=test`
- `GITHUB_PAT` — fallback alias for `GITHUB_TOKEN`
- DI container (`src/platform/container.ts`) — in tests, adapters are swapped through it, not patched globally

## Read when
- Module structure and DI flow → [README.md](README.md)
- Full API endpoint map → [README.md](README.md)
- Architectural decisions per module → [docs/](docs/)
- Expected behavior of a new feature → [specs/](specs/)
- Odd behavior not visible from code → [insights.md](insights.md)
