# e2e/ — @devdigest/e2e

Детерміновані browser e2e через `agent-browser` (не Playwright, не Cypress).

## Commands
```sh
pnpm test   # потрібен повний стек: Postgres + API :3001 + web :3000
```

## Rules
- **Без LLM-викликів** — всі тести детерміновані; AI-відповіді мокаються на рівні API
- Повний стек перед запуском: `./scripts/dev.sh` або CI service definitions

## Read when
- API драйвера agent-browser → [README.md](README.md)
- Які flow вже покриті → [specs/](specs/)
- Дивна поведінка тестів → [insights.md](insights.md)
