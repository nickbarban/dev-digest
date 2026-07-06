import type { CSSProperties } from "react";

/** Co-located styles for SeverityFilterBar. */
export const s = {
  bar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  } satisfies CSSProperties,
} as const;
