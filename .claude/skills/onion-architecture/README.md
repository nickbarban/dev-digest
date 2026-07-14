# Onion Architecture

A guide for backend layer boundaries and dependency direction — where routing, orchestration, data access, and pure domain logic live in `server/` and `reviewer-core/`, and which way imports are allowed to point.

## Overview

- Layer map: domain (`reviewer-core/`) → application (`service.ts`/`run-executor.ts`) → infrastructure (`repository.ts`, `adapters/`) → presentation (`routes.ts`)
- Dependency direction — inward only, never outward
- Interfaces defined by the core, implemented at the edge (ports/adapters via `platform/container.ts`)
- Where business logic lives — routes vs service vs a dedicated use-case file
- Repository boundary — one DB entry point per module, split by aggregate only when earned
- Testing through ports — mock adapters, not the database
- Pragmatism — when *not* to add a new interface/layer

## When This Skill Applies

- Adding a new `server/src/modules/<name>/` module and deciding how to split it
- Deciding whether new logic belongs in `routes.ts`, `service.ts`, a dedicated use-case file, or `repository.ts`
- Wiring a new external integration (LLM provider, GitHub, git, secrets, etc.)
- Reviewing a PR where a route touches the DB directly, or business logic leaks into `routes.ts`
- Reviewing a PR that adds a new interface/adapter for something with only one implementation and no test need to swap it — judging whether that's warranted or premature

## Relationship to Other Skills

| Skill | Owns |
|---|---|
| [fastify-best-practices](../fastify-best-practices/SKILL.md) | Route registration, plugins, JSON-schema validation, hooks, error handling mechanics |
| [drizzle-orm-patterns](../drizzle-orm-patterns/SKILL.md) | Query syntax, relations, transactions, migrations |
| [postgresql-table-design](../postgresql-table-design/SKILL.md) | Table/column/index/constraint design |
| **onion-architecture** (this skill) | *Which layer* code belongs in and *which direction* imports may point — not how to write the route, query, or schema itself |

This skill deliberately does not restate rules already owned by the three skills above — it cross-references them instead, following the same pattern as [react-ui-architecture](../react-ui-architecture/SKILL.md) on the frontend side.

## Version

**1.0.0** — 2026-07-14

- Initial version. Derived from this repo's actual `server/src/modules/` and `reviewer-core/src/` structure (verified against `reviews/` — the most-layered module — and `agents/`/`settings/` as simpler counter-examples) plus the external research below.

## Sources

Full list of sources used to build this skill, by category. The same list is duplicated at [`docs/onion-architecture-sources.md`](../../../docs/onion-architecture-sources.md) for visibility outside the skills folder.

### Onion Architecture — Origin & Theory
- [The Onion Architecture: part 1 — Jeffrey Palermo](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-1/) — the original 2008 post coining the term
- [The Onion Architecture: part 2 — Jeffrey Palermo](https://jeffreypalermo.com/2008/07/the-onion-architecture-part-2/)
- [Onion Architecture — Herberto Graça](https://herbertograca.com/2017/09/21/onion-architecture/)
- [Onion Architecture — Marco Lenzo](https://marcolenzo.eu/the-onion-architecture-explained/)
- [Onion Architecture — Think To Code](https://www.thinktocode.com/2018/08/16/onion-architecture/)
- [Onion Architecture: Definition, Principles & Benefits — CodeGuru](https://www.codeguru.com/csharp/understanding-onion-architecture/)

### Onion vs Clean vs Hexagonal
- [Onion vs Clean vs Hexagonal Architecture — Eric Damtoft](https://medium.com/@edamtoft/onion-vs-clean-vs-hexagonal-architecture-9ad94a27da91)
- [Stop Confusing Clean, Onion & Hexagonal — Rup Singh](https://medium.com/@rup.singh88/stop-confusing-clean-onion-hexagonal-architecture-heres-when-to-use-each-692079e56267)
- [Understanding Hexagonal, Clean, Onion, and Layered Architectures — Roman Glushach](https://romanglushach.medium.com/understanding-hexagonal-clean-onion-and-traditional-layered-architectures-a-deep-dive-c0f93b8a1b96)
- [Demystifying software architecture patterns — Thoughtworks](https://www.thoughtworks.com/insights/blog/architecture/demystify-software-architecture-patterns)

### Node.js / TypeScript Implementations
- [Onion Architecture in Node.js with TypeScript — Sankhadip Samanta](https://sankhadip.medium.com/onion-architecture-in-node-js-with-typescript-5508612a4391)
- [Implementing SOLID and the onion architecture in Node.js with TypeScript and InversifyJS — DEV Community](https://dev.to/remojansen/implementing-the-onion-architecture-in-nodejs-with-typescript-and-inversifyjs-10ad)
- [Building Scalable Applications with TypeScript — Codez Up](https://codezup.com/building-scalable-applications-with-typescript-a-step-by-step-guide-to-clean-code-architecture/)

### Fastify-Specific
- [fastify-clean-architecture — revell29 (GitHub)](https://github.com/revell29/fastify-clean-architecture)
- [clean-architecture-fastify-mongodb — borjatur (GitHub)](https://github.com/borjatur/clean-architecture-fastify-mongodb)
- [Effortless File Structure Setup for Node.js Fastify Projects](https://mbebars.medium.com/effortless-file-structure-setup-for-node-js-fastify-projects-481561df51a1)

### Repository Pattern / Dependency Inversion
- [Onion Architecture: Going Beyond Layers — NDepend Blog](https://blog.ndepend.com/onion-architecture-layers/)
- [Atomic Repositories in Clean Architecture and TypeScript — Sentry Blog](https://blog.sentry.io/atomic-repositories-in-clean-architecture-and-typescript/)
- [Repository Pattern in Nest.js with Drizzle ORM — vimulatus](https://medium.com/@vimulatus/repository-pattern-in-nest-js-with-drizzle-orm-e848aa75ecae)
- [Transactions with DDD and Repository Pattern in TypeScript — João Batista da Silva](https://medium.com/@joaojbs199/transactions-with-ddd-and-repository-pattern-in-typescript-a-guide-to-good-implementation-part-2-da0af3e10901)

### Pitfalls / When Not to Use It
- [Overengineering in Onion/Hexagonal Architectures — Victor Rentea](https://victorrentea.ro/blog/overengineering-in-onion-hexagonal-architectures/)
- [Why to avoid onion-like architectures — DEV Community](https://dev.to/yelldutz/why-to-avoid-onion-like-architectures-2435)

### Testing Through Ports
- [Testing an onion architecture - done right (slides)](https://www.slideshare.net/michelschudel/testing-an-onion-architecture-done-right)

### Lightweight Dependency Injection in TypeScript (context only — this repo uses a hand-written `container.ts`, not a DI framework)
- [Dependency Injection in Node.js & TypeScript — thetshaped.dev](https://thetshaped.dev/p/dependency-injection-in-nodejs-and-typescript-dependency-inversion-part-no-body-teaches-you)
- [Top 5 TypeScript dependency injection containers — LogRocket](https://blog.logrocket.com/top-five-typescript-dependency-injection-containers/)
