# reviewer-core/ — @devdigest/reviewer-core

Pure review engine: diff → prompt → LLM → grounded findings.

## Commands
```sh
pnpm test     # vitest з MockLLMProvider — реального LLM-виклику немає
pnpm build    # typecheck only; JS не емітується
```

## Critical constraints
- **Немає DB, GitHub, filesystem** — єдиний side effect = ін'єктований `LLMProvider`
- **Немає JS build** — споживається через tsconfig path alias напряму як TypeScript
- **Grounding gate обов'язковий і безумовний** — `groundFindings()` запускається
  після КОЖНОЇ стратегії; ніколи не пропускати
- **Score рахується з тих findings, що пройшли gate** — не довіряй числу від моделі;
  авторитет — `scoreFromFindings(ground.kept)`

## Pipeline
`assemblePrompt()` → LLM call(s) → `reduceReviews()` → `groundFindings()` → `ReviewOutcome`

## Non-default conventions
- Весь untrusted контент (prDescription, specs, repoMap) проходить через `wrapUntrusted()`
- map-reduce спрацьовує тільки коли diff > 400 рядків І > 1 файл (обидві умови)
- Слоти `ReviewInput` (skills, memory, specs, callers) — resolved strings; caller
  резолвить slugs → bodies ДО виклику engine

## Read when
- Повна схема pipeline → [README.md](README.md)
- Prompt assembly або injection hardening → [README.md](README.md)
- Додаєш новий prompt-слот → [docs/](docs/)
- Дизайн-рішення, які не видно з коду → [insights](insights)
