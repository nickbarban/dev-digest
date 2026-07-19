---
name: onion-architecture
description: "Onion Architecture layer boundaries and dependency direction for the backend (server/ + reviewer-core/). Use when adding or reviewing a server module, deciding whether logic belongs in a route/service/repository/adapter, wiring a new external integration, or reviewing a PR that reaches across layers."
---

# Onion Architecture

Rules for *layer boundaries and dependency direction* in the backend — not routing mechanics, not ORM mechanics, not schema design. For code examples, see [examples.md](examples.md). For the full source list, see [README.md](README.md).

## Relationship to Other Skills

This skill owns *which layer code belongs in* and *which direction imports may point*. It does not restate rules owned elsewhere:

- Route registration, JSON-schema validation, hooks, plugins → [fastify-best-practices](../fastify-best-practices/SKILL.md). This skill only says routes must stay thin and push logic inward.
- Query syntax, relations, transactions, migrations → [drizzle-orm-patterns](../drizzle-orm-patterns/SKILL.md). This skill only says which layer is allowed to import `drizzle-orm`/`db/schema.ts`.
- Table/column/index design → [postgresql-table-design](../postgresql-table-design/SKILL.md).

## Severity Levels

- **CRITICAL** — Will cause bugs, broken reconciliation, or maintenance nightmares
- **HIGH** — Will cause performance issues or scaling problems
- **MEDIUM** — Will hurt maintainability or developer experience

---

## Layer Map (CRITICAL)

This repo already has an onion shape — this skill names it and makes it non-negotiable rather than inventing something new.

```
                     ┌─────────────────────────────┐
                     │  routes.ts (presentation)    │  HTTP ⇄ domain translation only
                     │  ┌─────────────────────────┐ │
                     │  │ service.ts /             │ │  use cases, orchestration
                     │  │ run-executor.ts          │ │
                     │  │  (application)           │ │
                     │  │  ┌──────────────────────┐│ │
                     │  │  │ reviewer-core/        ││ │  pure domain logic,
                     │  │  │ (domain)              ││ │  zero I/O except injected ports
                     │  │  └──────────────────────┘│ │
                     │  └─────────────────────────┘ │
                     │  repository.ts, adapters/     │  infrastructure — DB, LLM,
                     │  (infrastructure)              │  GitHub, git, filesystem
                     └─────────────────────────────┘
```

| Ring | Real folders | Owns |
|---|---|---|
| Domain | `reviewer-core/src/` | Pure review logic. No DB, no GitHub, no filesystem — the only side effect is an injected `LLMProvider` |
| Application | `server/src/modules/<name>/service.ts`, `run-executor.ts` | Use-case orchestration: calls the domain, calls repositories/adapters through their interfaces, has no HTTP or SQL awareness |
| Infrastructure | `server/src/modules/<name>/repository.ts` (+ `repository/*.repo.ts`), `server/src/adapters/*` | Implements the interfaces the inner rings depend on: Drizzle queries, LLM providers, GitHub/git clients, secrets |
| Presentation | `server/src/modules/<name>/routes.ts` | Fastify route registration, Zod schema, translating HTTP ⇄ service calls. No business logic, no DB access |

## Dependency Direction (CRITICAL)

- Dependencies point inward only: `routes.ts` → `service.ts`/`run-executor.ts` → repositories/adapters (via interfaces) → `reviewer-core/`. Never the reverse.
- `reviewer-core/` imports nothing from `server/` — it is framework-, DB-, and HTTP-agnostic by construction. Keep it that way.
- `routes.ts` never imports `db/schema.ts`, `drizzle-orm`, or any `adapters/*` implementation directly — only the module's `service.ts`.
- `service.ts`/`run-executor.ts` never import Fastify types (`FastifyRequest`, `FastifyReply`) — they take plain data in, return plain data out.
- Only `repository.ts` (and its `repository/*.repo.ts` sub-files) touches `db/schema.ts` / Drizzle for a given module — see `server/src/modules/reviews/repository.ts`'s own doc comment: "the ONLY layer touching the DB for the review domain."

## Interfaces Defined by the Core, Implemented at the Edge (CRITICAL)

- External integrations (`LLMProvider`, `GitHubClient`, `GitClient`, `SecretsProvider`, `Embedder`, `CodeIndex`, `AuthProvider`) are interfaces from `@devdigest/shared`, implemented by concrete classes under `server/src/adapters/<name>/`.
- Application-layer code (services, `run-executor.ts`) depends on the interface type, never the concrete adapter class — that's what makes `adapters/mocks.ts` swappable in tests.
- `server/src/platform/container.ts` is the composition root: it is the *only* place allowed to import concrete adapter classes and wire them to interfaces. Don't `new` an adapter anywhere else.
- Adding a new external integration means: define/extend the interface in `@devdigest/shared`, implement it under `adapters/<name>/`, wire it in `container.ts` — never reach for the concrete class from a service.

## Where Business Logic Lives (HIGH)

- `routes.ts` = HTTP translation only: parse/validate params, call one service method, shape the response. Zero conditionals about business rules.
- `service.ts` = the module's use cases — orchestrates repository + adapter calls, applies business rules that fit in a page.
- A use case big enough to need its own state machine, cancellation, or streaming (like review execution) gets its own file (`run-executor.ts`), imported by `service.ts` — not inlined into either `service.ts` or `routes.ts`.
- Pure, reusable domain logic (prompt assembly, grounding, map-reduce) belongs in `reviewer-core/`, not duplicated inside `server/`.

## Repository Boundary (HIGH)

- One `repository.ts` (or a `repository/` folder split by aggregate, as in `reviews/repository/{pull.repo.ts,review.repo.ts,run.repo.ts}`) per module — the sole Drizzle entry point for that module's tables.
- Split a `repository.ts` into `repository/*.repo.ts` once it spans multiple aggregates/tables that don't share a natural single-file scope — compose them back into one exported class so the module's public repository API stays a single import.
- For query syntax, joins, and transactions themselves, defer to [drizzle-orm-patterns](../drizzle-orm-patterns/SKILL.md) — this skill only enforces *where* those queries are allowed to live.

## Testing Through Ports (HIGH)

- Mock at the adapter boundary (`server/src/adapters/mocks.ts` — `MockLLMProvider`, `MockGitHubClient`, `MockGitClient`, etc.), not the database — see [TESTING.md](../../../TESTING.md): "Mock the outside world... hit a real Postgres, not a mock DB."
- Because services depend on adapter *interfaces*, tests construct the container with `overrides` (real DB, mocked LLM/GitHub/git) instead of mocking service methods directly.
- If a new test needs to fake an external system, add the fake to `adapters/mocks.ts` alongside the existing ones rather than stubbing inside the test file.

## Pragmatism — When Not to Add a New Layer (CRITICAL)

Onion Architecture pays off where business logic is nontrivial. Forcing every module through the same ceremony regardless of complexity is the failure mode this section exists to prevent.

- The routes → service → repository split is the floor for every module (it costs nothing and keeps layers testable) — but a simple CRUD module (e.g. `settings`) does not need its own `run-executor.ts`-style use-case file, extra interfaces, or a split `repository/` folder. Compare `agents/` (single `repository.ts`, single `service.ts`) with `reviews/` (split repository + `run-executor.ts`) — the latter earned the extra structure through actual complexity (streaming, cancellation, multi-aggregate persistence), not by default.
- Don't introduce a new interface + adapter for something with exactly one implementation and no test-time need to swap it — that's speculative generality. Add the interface when a second implementation or a mock is actually needed.
- Don't split `repository.ts` into `repository/*.repo.ts` until it actually spans multiple aggregates — a 50-line repository stays one file.
- When reviewing a PR: flag a *missing* boundary (route doing a DB query, service importing Fastify types) as CRITICAL; flag *premature* extra layers on a simple module as a MEDIUM simplification note, not a blocker.
