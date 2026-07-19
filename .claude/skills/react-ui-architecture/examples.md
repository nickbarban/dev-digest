# React UI Architecture — Examples

Good/bad placement patterns for each rule in [SKILL.md](SKILL.md). These are about *where files go*, not implementation — folder trees, not component code.

---

## Folder Structure Decision Tree

```
BAD: new component with a single caller dropped straight into the shared folder
src/components/AgentSummaryCard.tsx        # only app/agents/ uses this today

GOOD: starts route-private, promoted later once a second route needs it
src/app/agents/_components/AgentSummaryCard.tsx
# → moved to src/components/agent-summary-card/ only once app/repos/ needs it too
```

---

## Component Folder Pattern

```
BAD: constants and helpers inlined at the top of the component file, no folder
src/app/agents/_components/AgentCard.tsx   # 40 lines of consts + helpers above the component

GOOD: real pattern used in this repo
src/app/agents/_components/AgentCard/
├── AgentCard.tsx
├── AgentCard.test.tsx
├── constants.ts
├── helpers.ts
├── styles.ts
└── index.ts        # export { AgentCard, AgentCard as default } from "./AgentCard";
```

---

## When to Split a Component Into a Folder

```
BAD: ConfigTab's ~150 lines of JSX and state inlined directly in AgentEditor.tsx

GOOD: real pattern used in this repo — nested, route-private sub-component
src/app/agents/[id]/_components/AgentEditor/
├── AgentEditor.tsx
└── _components/
    └── ConfigTab/
        ├── ConfigTab.tsx
        ├── constants.ts
        ├── styles.ts
        └── index.ts
```

---

## Constants Placement

```
BAD: top-level grab-bag
src/constants/index.ts   # unrelated app-wide constants dumped together

GOOD: colocated (component-local)
src/app/agents/_components/AgentCard/constants.ts

GOOD: legitimately cross-feature, promoted to lib/
src/lib/feature-models.ts
src/lib/model-label.ts
```

---

## Utils, Helpers, and `lib/`

```
BAD: top-level grab-bag mixing pure formatting with network code
src/utils/miscHelpers.ts   # formatDate() next to fetchAgentStatus()

GOOD: split by nature, not dumped together
src/components/diff-viewer/helpers.ts   # pure formatting, only diff-viewer uses it
src/lib/api.ts                          # talks to the outside world, used everywhere
```

---

## Hook Placement

```
BAD: the same data-fetching hook redefined in two route folders
src/app/agents/_components/useAgentsList.ts
src/app/repos/_components/useAgentsList.ts   # duplicate logic

GOOD: real pattern used in this repo
src/lib/hooks/agents.ts     # useAgents(), useAgent(), useCreateAgent()
src/lib/hooks/index.ts      # export * from "./agents";
# both app/agents/ and app/repos/ import from "@/lib/hooks"

GOOD: single-consumer hook stays colocated
src/components/app-shell/hooks/
├── useGlobalShortcuts.ts
├── useShellCommands.ts
├── useShellContext.ts
└── index.ts
```

---

## Barrel Files & Naming

```
BAD: consumer reaches past the barrel
import { AgentCard } from "@/app/agents/_components/AgentCard/AgentCard";

GOOD: consumer imports the folder, resolved via index.ts
import { AgentCard } from "@/app/agents/_components/AgentCard";
```

---

## Promotion Path

```
BAD: created directly under components/ "in case it's reused later", one caller today
src/components/shared/AgentBadge.tsx

GOOD: created where it's actually used first
src/app/agents/_components/AgentBadge.tsx
# → moved to src/components/agent-badge/ only when app/repos/ needs it too:
src/components/agent-badge/
├── AgentBadge.tsx
└── index.ts
```

---

## Import Direction & Boundaries

```
BAD: shared component reaching into a specific route's private folder
// components/diff-viewer/helpers.ts
import { formatAgentName } from "@/app/agents/_components/AgentCard/helpers";

GOOD: shared logic moved down to lib/ first, both sides import from there
// lib/helpers/agent-name.ts (or lib/model-label.ts if it already fits)
export function formatAgentName(...) { ... }
// both app/agents/ and components/diff-viewer/ import from "@/lib/..."
```

---

## Styles Colocation

```
BAD: style object literal recreated inline on every render
<div style={{ display: "flex", gap: 8, opacity: isActive ? 1 : 0.5 }}>

GOOD: real pattern used in this repo
// components/diff-viewer/styles.ts
export const s = {
  row: { display: "flex", gap: 8 },
} satisfies Record<string, CSSProperties>;
// consumer: <div style={s.row}>
```

---

## `vendor/` Boundary

```
BAD: app-specific behavior added directly inside the vendored kit
src/vendor/ui/kit/Button.tsx   # hand-edited to add analytics tracking

GOOD: vendored primitive wrapped in a local component
src/components/tracked-button/
├── TrackedButton.tsx   # wraps vendor/ui/kit's Button, adds tracking
└── index.ts
```
