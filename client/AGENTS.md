# client/ — @devdigest/web

Next.js 15 App Router + React 19 + TanStack Query + Tailwind 4.

## Commands
```sh
pnpm dev        # :3000
pnpm test       # vitest + jsdom (no API — fetch is mocked)
pnpm typecheck
```

## Where things live
- `src/app/` — App Router pages (thin RSC shells; no logic)
- `src/lib/hooks/` — all TanStack Query data hooks; API calls live here
- `src/lib/api.ts` — single API client; base URL from `NEXT_PUBLIC_API_BASE`
- `src/components/` — shared components
- `src/vendor/ui/` — vendored UI primitives (`@devdigest/ui`) — do NOT edit
- `src/vendor/shared/` — vendored Zod contracts — edit source, then sync here
- `messages/<locale>/` — all UI strings (next-intl)

## Non-default conventions
- All user-facing strings — via `useTranslations()`, not string literals
- Pages = thin RSC; all client logic — in `_components/` next to the page
- `src/vendor/ui/` — do not abstract further; this is the design-system boundary

## Gotchas
- `src/vendor/shared/` — COPY of shared contracts; changes must be synced manually

## Read when
- Routes and which APIs they use → [README.md](README.md)
- Adding a new screen → [README.md](README.md)
- Feature spec → [specs/](specs/)
- Odd UI behavior → [insights.md](insights.md)
