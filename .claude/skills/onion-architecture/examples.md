# Onion Architecture — Examples

Good/bad layering patterns for each rule in [SKILL.md](SKILL.md), built on real modules in this repo.

---

## Dependency Direction

```ts
// BAD — routes.ts reaching past service.ts into the DB
// server/src/modules/reviews/routes.ts
import * as t from '../../db/schema.js';
app.get('/pulls/:id/reviews', async (req) => {
  return db.select().from(t.reviews).where(eq(t.reviews.pullId, req.params.id));
});

// GOOD — real code: routes.ts calls the service, nothing else
// server/src/modules/reviews/routes.ts
import { ReviewService } from './service.js';
const service = new ReviewService(container);
app.get('/pulls/:id/reviews', async (req) => service.listForPull(req.params.id));
```

```ts
// BAD — service.ts aware of Fastify
export class ReviewService {
  async run(req: FastifyRequest, reply: FastifyReply) { /* ... */ }
}

// GOOD — real code: service.ts takes/returns plain data, container is DI, not Fastify
export class ReviewService {
  constructor(private container: Container) {}
  async run(pullId: string, agentId: string) { /* ... */ }
}
```

---

## Interfaces Defined by the Core, Implemented at the Edge

```ts
// BAD — a service reaching for a concrete adapter class directly
import { OctokitGitHubClient } from '../../adapters/github/octokit.js';
export class ReposService {
  private github = new OctokitGitHubClient(token); // bypasses the container
}

// GOOD — real pattern: depend on the interface, resolve via container
// server/src/platform/container.ts — the ONLY file that imports concrete adapters
import { OctokitGitHubClient } from '../adapters/github/octokit.js';
import type { GitHubClient } from '@devdigest/shared';
// ...container wires GitHubClient → OctokitGitHubClient (or a ContainerOverrides mock)

// server/src/modules/repos/service.ts — depends on the interface only
export class ReposService {
  constructor(private container: Container) {} // container.github: GitHubClient
}
```

---

## Where Business Logic Lives

```
BAD: review orchestration (streaming, cancellation, persistence) inlined into service.ts
server/src/modules/reviews/service.ts   # 900+ lines mixing use-case orchestration
                                         # with the run's internal state machine

GOOD: real structure in this repo
server/src/modules/reviews/
├── service.ts          # thin orchestrator: finding actions, listing
├── run-executor.ts      # the run's own state machine (cancellation, streaming),
│                         # imported by service.ts, not merged into it
└── repository.ts
```

```ts
// GOOD — real code: reviewer-core owns pure domain logic, run-executor.ts calls it
// server/src/modules/reviews/run-executor.ts
import { reviewPullRequest, countBlockers } from '@devdigest/reviewer-core';
// run-executor.ts orchestrates I/O (diff loading, persistence, SSE events);
// reviewPullRequest() itself has zero knowledge of Fastify, Drizzle, or GitHub
```

---

## Repository Boundary

```
BAD: query logic duplicated inline in service.ts instead of the repository
// service.ts
const [pull] = await db.select().from(t.pulls).where(eq(t.pulls.id, prId));

GOOD: real code — repository.ts is the sole DB entry point, composed from
sub-repos when a module spans multiple aggregates
server/src/modules/reviews/
├── repository.ts             # composes the three below into one ReviewRepository
└── repository/
    ├── pull.repo.ts          # PR + intent aggregate
    ├── review.repo.ts        # reviews + findings aggregate
    └── run.repo.ts           # agent_runs + run_traces aggregate
```

---

## Testing Through Ports

```ts
// BAD — mocking the database layer itself
vi.mock('../../db/client.js', () => ({ db: fakeDbClient }));

// GOOD — real pattern: mock the adapter, use a real (test) Postgres for the rest
// server/src/adapters/mocks.ts
export class MockLLMProvider implements LLMProvider { /* ... */ }
export class MockGitHubClient implements GitHubClient { /* ... */ }

// test setup
const container = buildContainer({
  overrides: { llm: { openai: new MockLLMProvider() }, github: new MockGitHubClient() },
  // db is the real test Postgres — not mocked
});
```

---

## Pragmatism — Simple Module vs Complex Module

```
GOOD: settings/ — simple CRUD, floor-only layering, no extra ceremony
server/src/modules/settings/
├── constants.ts
├── feature-models.ts
├── helpers.ts
└── routes.ts        # talks to a lightweight service inline — no run-executor.ts,
                      # no split repository/, no extra interfaces — proportionate to
                      # its actual complexity

GOOD: reviews/ — earned the extra structure through real complexity
server/src/modules/reviews/
├── routes.ts
├── service.ts
├── run-executor.ts   # streaming + cancellation state machine
└── repository/       # split by aggregate — three tables, three concerns

BAD: copying reviews/'s full structure onto a module with one table and
three simple CRUD endpoints "for consistency" — adds indirection with no payoff
```
