# e2e/ — @devdigest/e2e

Deterministic browser e2e via `agent-browser` (not Playwright, not Cypress).

## Commands
```sh
pnpm test   # full stack required: Postgres + API :3001 + web :3000
```

## Rules
- **No LLM calls** — all tests are deterministic; AI responses are mocked at the API level
- Full stack before running: `./scripts/dev.sh` or CI service definitions

## Read when
- agent-browser driver API → [README.md](README.md)
- Which flows are already covered → [specs/](specs/)
- Odd test behavior → [insights.md](insights.md)
