# server/ — @devdigest/api

Fastify 5 + Drizzle ORM + Postgres (pgvector).

## Commands
```sh
pnpm dev                                            # :3001
pnpm db:migrate                                     # застосувати міграції
pnpm db:seed                                        # ідемпотентні demo-дані
pnpm exec vitest run --exclude '**/*.it.test.ts'    # unit (без Docker)
pnpm exec vitest run .it.test                       # integration (потрібен Docker)
```

## Where things live
- `src/modules/<name>/` — feature slice: routes + service + repository
- `src/adapters/` — ports: llm, github, git, astgrep, embedder, secrets
- `src/db/schema/` — Drizzle schema (всі таблиці курсу вже тут; порожні = стаби для майбутніх уроків)
- `src/platform/` — DI container, config, error handler
- `src/vendor/shared/` — vendored копія `@devdigest/shared`

## Non-default conventions
- Route schema = Zod через `fastify-type-provider-zod` — один schema керує
  валідацією запиту І серіалізацією відповіді
- `*.it.test.ts` = integration (real Postgres через testcontainers);
  все решта = hermetic unit
- SSE на `POST /runs` через `fastify-sse-v2` — events: `tool | result | info`
- `run-executor.ts` — єдина точка оркестрації review: викликає `reviewer-core`,
  зберігає findings, стрімить SSE; не дублювати логіку в routes або service

## Gotchas
- Rate limit: 120/min глобально, жорсткіше на `/pulls/:id/review`; вимкнено при `NODE_ENV=test`
- `GITHUB_PAT` — fallback alias для `GITHUB_TOKEN`
- DI container (`src/platform/container.ts`) — в тестах адаптери свапаються через нього, не патчаться глобально

## Read when
- Структура модулів і DI flow → [README.md](README.md)
- Повна карта API ендпоінтів → [README.md](README.md)
- Архітектурні рішення по модулю → [docs/](docs/)
- Очікувана поведінка нової фічі → [specs/](specs/)
- Дивна поведінка, яку не видно з коду → [insights.md](insights.md)
