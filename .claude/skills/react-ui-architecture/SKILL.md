---
name: react-ui-architecture
description: "React/Next.js frontend architecture and code organization — where components, constants, utils, hooks, and business logic live on disk; how and when to split a component into a folder; folder structure and naming conventions. Use when creating a new component/route, deciding where a new file belongs, or reviewing a PR that adds files in an unexpected location."
---

# React UI Architecture

Rules for *where code lives*, not what it does. For code examples, see [examples.md](examples.md). For the full source list, see [README.md](README.md).

## Relationship to Other Skills

This skill owns file/folder **placement** only. It does not restate rules owned elsewhere:

- Whether logic belongs in a hook vs a component body, state colocation values, composition patterns, performance, a11y → [react-best-practices](../react-best-practices/SKILL.md). This skill only says *where that hook's file goes*.
- `app/` router file conventions (`page.tsx`, `layout.tsx`, RSC boundaries, route segments) → [next-best-practices](../next-best-practices/SKILL.md). This skill only says where a route's *private components* live inside `app/<feature>/_components/`.

## Severity Levels

- **CRITICAL** — Will cause bugs, broken reconciliation, or maintenance nightmares
- **HIGH** — Will cause performance issues or scaling problems
- **MEDIUM** — Will hurt maintainability or developer experience

---

## Folder Structure Decision Tree (CRITICAL)

```
src/
├── app/<feature>/_components/   # route-private — only that route imports these
├── components/<group>/          # reusable — imported by 2+ routes
├── lib/                         # non-component, cross-cutting code (API, hooks, types, providers)
└── vendor/                      # vendored third-party / shared contracts — boundary, don't edit internals
```

- `app/<feature>/_components/` — component is specific to one route; nobody else imports it
- `components/<group>/` — component is genuinely reused across 2+ routes
- `lib/` — non-component code shared across features: API client, types, context providers, domain hooks
- `vendor/` — vendored `@devdigest/shared` contracts and the UI kit; treat as a boundary
- Default new components to route-private (`_components/`); promote to `components/` only once a second route needs it (see Promotion Path below)

## Component Folder Pattern (CRITICAL)

Every component folder uses up to 5 standard files — create only the ones actually needed, never scaffold empty ones:

| File | Purpose |
|---|---|
| `ComponentName.tsx` | the component |
| `index.ts` | barrel export |
| `constants.ts` | component-local constants |
| `helpers.ts` | component-local pure helper functions |
| `styles.ts` | colocated `CSSProperties` objects |

- Folder name is PascalCase and matches the component's exported name exactly (`AgentCard/AgentCard.tsx`)
- `index.ts` always re-exports both named and default: `export { X, X as default } from "./X";`
- Tests are colocated as `ComponentName.test.tsx` in the same folder — for what to test, see [react-testing-library](../react-testing-library/SKILL.md)
- A single-file component (no folder, no `index.ts`) is fine until it needs a second file

## When to Split a Component Into a Folder (HIGH)

- Start as a single `.tsx` file directly in `_components/` or `components/`; promote to a folder the moment it needs a `constants.ts`, `helpers.ts`, or a sub-component
- Extract a sub-component into a nested `_components/` when a JSX block has its own state/handlers/props contract distinct from the parent — not just because the parent file is long (see `react-best-practices`' 200-line trigger for *when* to split; this section covers *where the split lands on disk*)
- A sub-component with a single caller stays nested under that parent (`AgentEditor/_components/ConfigTab/`) — don't promote it to `components/` until a second parent needs it
- Avoid nesting `_components/` more than 2 levels deep — flatten, or promote to `components/` instead

## Constants Placement (HIGH)

- Default: colocate in the component's own `constants.ts`, even for a single export
- Constants shared by several sibling components in the same folder go one level up, at the group root (`components/diff-viewer/constants.ts`), not duplicated per sibling
- Promote to `lib/` (e.g. `lib/feature-models.ts`, `lib/model-label.ts`) only when the constant is genuinely used by 2+ unrelated route trees
- Never create a top-level `constants/` folder — this repo has none; it becomes an unscoped grab-bag with no ownership

## Utils, Helpers, and `lib/` (HIGH)

- `helpers.ts` = pure, presentation-adjacent functions used only by the component(s) in that folder (formatting, small transforms) — colocated, not centralized
- `lib/` = cross-cutting code that talks to the outside world or is shared across unrelated features: API client (`lib/api.ts`), typed contracts (`lib/types.ts`), context providers (`lib/providers.tsx`, `lib/theme.tsx`, `lib/toast.tsx`), domain utilities (`lib/github-urls.ts`)
- This repo has no top-level `utils/` folder — don't create one. The general "utils vs lib" distinction maps here to `helpers.ts` (colocated, pure) vs `lib/` (heavier/integration code), not to two competing top-level folders
- Promotion rule of thumb: same logic needed by 2+ features/routes → move to `lib/`; still tied to one component's rendering → stays in that component's `helpers.ts`

## Hook Placement — Colocated vs Shared (HIGH)

This is about *file location* only — for the hooks-for-business-logic rule itself, see `react-best-practices`.

- A hook used by exactly one component lives in a local `hooks/` subfolder next to it, with its own barrel (`components/app-shell/hooks/index.ts`)
- A hook used across multiple features/routes — typically data fetching — goes in `lib/hooks/`, one file per domain (`agents.ts`, `reviews.ts`, `trace.ts`, `repo-intel.ts`, `core.ts` for the shared `useApiQuery`/`useApiMutation`), re-exported from `lib/hooks/index.ts`
- Files in `lib/hooks/` are named by domain, not by hook — related hooks (`useAgents`, `useAgent`, `useCreateAgent`) live together in `agents.ts`

## Barrel Files & Naming Conventions (MEDIUM)

- Every component folder gets an `index.ts` barrel; consumers import the folder path, never `ComponentName.tsx` directly
- Barrel form: `export { X } from "./X";` — add `X as default` only when something actually default-imports it (most consumers use the named import; don't add a default re-export "just in case")
- Route/group folders (`app/<feature>/`, `components/<feature-group>/`) are lowercase-kebab; individual component folders are PascalCase matching the exported component name
- Inside a file: imports → constants → helpers → component → exports — see `react-best-practices`' File Quality rule, not restated here

## Promotion Path — Colocate First, Extract Later (CRITICAL)

The core philosophy: nothing gets extracted or shared until a second real consumer exists.

- Component: `_components/` (route-private) → `components/` (shared) — never start a new component directly in `components/` on a hunch it might be reused later
- Constants/helpers: component-local → group-root (`diff-viewer/helpers.ts`) → `lib/` (`lib/model-label.ts`) → `vendor/shared/` only if it's truly a backend-shared contract
- Red flag: a `constants.ts`/`helpers.ts` with 1-2 unrelated exports "just in case" is premature — inline until a real second use exists

## Import Direction & Boundaries (HIGH)

- Unidirectional: `app/` may import from `components/`, `lib/`, `vendor/`; `components/` may import from `lib/`, `vendor/`, never from `app/`; `lib/` may import from `vendor/`, never from `app/` or `components/`
- Sibling route folders under `app/` must not import each other's `_components/` — if two routes need the same component, that's the signal to promote it to `components/`
- `vendor/` is a boundary, not a place for app logic — wrap/adapt vendored code from `lib/` or `components/` instead of editing inside `vendor/`

## Styles Colocation (MEDIUM)

- `styles.ts` exports a `satisfies CSSProperties` object map, colocated per component/group, for cases Tailwind utilities don't cleanly cover (dynamic/computed inline styles) — `react-best-practices`' Tailwind section still governs *when* to reach for this vs a utility class
- Scope it like `constants.ts`/`helpers.ts`: component-local by default, group-root if shared by siblings

## `vendor/` Boundary (MEDIUM)

- `vendor/shared/` = vendored `@devdigest/shared` contracts — read-only/generated, don't hand-edit business logic in it (see [AGENTS.md](../../../AGENTS.md) gotchas on syncing vendored copies)
- `vendor/ui/{charts,command-palette,kit,primitives,shell}` = vendored UI kit — compose from it in `components/`/`app/`, don't modify internals

## Quick Reference Checklist (MEDIUM)

- New component, no extra files needed? → single `.tsx` in `_components/`
- Needs constants/helpers/styles/sub-components? → promote to a folder
- Used by 2+ routes? → move to `components/`
- Non-component code shared across features? → `lib/`
- Never create a top-level `utils/` or `constants/` folder
