# DevDigest

Local AI reviewer for PRs. Four separate packages — not a monorepo (each has its own
`package.json` + lockfile; shared code via tsconfig path aliases, not published modules).

| Package            | Folder           | Port |
|--------------------|------------------|------|
| Fastify API        | `server/`        | 3001 |
| Next.js studio     | `client/`        | 3000 |
| Pure review engine | `reviewer-core/` | —    |
| Browser e2e        | `e2e/`           | —    |

## Stack
Node ≥22 · pnpm ≥10 · TypeScript 5.7 · Docker (Postgres only)

## Quick start
```sh
./scripts/dev.sh              # Postgres + API + web
cd server && pnpm db:migrate  # REQUIRED on first run
```

## Gotchas
- **Port 5433, not 5432** — Docker maps `5433:5432` to avoid conflicts
- **`@devdigest/shared` is vendored, not published** — copies live in
  `server/src/vendor/shared/` and `client/src/vendor/shared/`; changes must be
  synced manually to both copies
- **`reviewer-core` does not compile to JS** — `build` = typecheck only;
  consumed via tsx/vitest directly
- **Migrations do not run automatically on startup** — always run `pnpm db:migrate`
  after pulling schema changes
- **Secrets live in `~/.devdigest/secrets.json`**, not in `.env` or the DB;
  the only read path is `server/src/adapters/secrets/local.ts`
- **PRs always target `nickbarban/dev-digest`**, not the `upstream` remote
  (`burnjohn/dev-digest`) — `gh pr create` defaults to `upstream` when both
  remotes exist, which opens the PR against the wrong repo. Use
  `gh repo set-default nickbarban/dev-digest` once per clone, or pass
  `--repo nickbarban/dev-digest` explicitly.

## Read when
- Touching server internals → read [server/README.md](server/README.md)
- Touching the review pipeline → read [reviewer-core/README.md](reviewer-core/README.md)
- Touching the UI → read [client/README.md](client/README.md)
- Adding an e2e test → read [e2e/README.md](e2e/README.md)
- Working with agent prompts → read [docs/agent-prompts/README.md](docs/agent-prompts/README.md)
- Questions about test strategy or CI → read [TESTING.md](TESTING.md)
