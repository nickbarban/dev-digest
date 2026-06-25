# DevDigest

Локальний AI-reviewer для PR. Чотири окремих пакети — не monorepo (кожен має власний
package.json + lockfile; shared код через tsconfig path aliases, не published модулі).

| Пакет              | Папка            | Порт |
|--------------------|------------------|------|
| Fastify API        | `server/`        | 3001 |
| Next.js studio     | `client/`        | 3000 |
| Pure review engine | `reviewer-core/` | —    |
| Browser e2e        | `e2e/`           | —    |

## Stack
Node ≥22 · pnpm ≥10 · TypeScript 5.7 · Docker (лише Postgres)

## Quick start
```sh
./scripts/dev.sh              # Postgres + API + web
cd server && pnpm db:migrate  # ОБОВ'ЯЗКОВО на першому запуску
```

## Gotchas
- **Port 5433, не 5432** — Docker маппить `5433:5432` щоб не конфліктувати
- **`@devdigest/shared` вендорується, не публікується** — копія в
  `server/src/vendor/shared/` і `client/src/vendor/shared/`; зміни треба
  синхронізувати вручну в обидві копії
- **`reviewer-core` не компілюється в JS** — `build` = лише typecheck;
  споживається через tsx/vitest напряму
- **Міграції не запускаються автоматично при старті** — завжди `pnpm db:migrate`
  після pull зі змінами схеми
- **Секрети живуть у `~/.devdigest/secrets.json`**, не в `.env` і не в DB;
  єдина точка читання — `server/src/adapters/secrets/local.ts`

## Read when
- Торкаєшся server internals → читай [server/README.md](server/README.md)
- Торкаєшся review pipeline → читай [reviewer-core/README.md](reviewer-core/README.md)
- Торкаєшся UI → читай [client/README.md](client/README.md)
- Додаєш e2e тест → читай [e2e/README.md](e2e/README.md)
- Працюєш з agent prompts → читай [docs/agent-prompts/README.md](docs/agent-prompts/README.md)
- Питання по тест-стратегії або CI → читай [TESTING.md](TESTING.md)
