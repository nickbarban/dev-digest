# client/ — @devdigest/web

Next.js 15 App Router + React 19 + TanStack Query + Tailwind 4.

## Commands
```sh
pnpm dev        # :3000
pnpm test       # vitest + jsdom (без API — fetch замоканий)
pnpm typecheck
```

## Where things live
- `src/app/` — App Router pages (тонкі RSC-оболонки; логіки немає)
- `src/lib/hooks/` — всі data-хуки TanStack Query; саме тут живуть API-виклики
- `src/lib/api.ts` — єдиний API-клієнт; base URL з `NEXT_PUBLIC_API_BASE`
- `src/components/` — shared компоненти
- `src/vendor/ui/` — vendored UI primitives (`@devdigest/ui`) — НЕ редагувати
- `src/vendor/shared/` — vendored Zod contracts — редагувати source, потім синхронізувати сюди
- `messages/<locale>/` — всі UI-рядки (next-intl)

## Non-default conventions
- Всі user-facing рядки — через `useTranslations()`, не string literals
- Pages = тонкі RSC; вся клієнтська логіка — у `_components/` поруч зі сторінкою
- `src/vendor/ui/` — не абстрагувати далі; це boundary дизайн-системи

## Gotchas
- `src/vendor/shared/` — КОПІЯ shared contracts; зміни треба синхронізувати вручну

## Read when
- Маршрути і які API вони використовують → [README.md](README.md)
- Додаєш новий екран → [README.md](README.md)
- Специфікація фічі → [specs/](specs/)
- Дивна поведінка UI → [insights.md](insights.md)
