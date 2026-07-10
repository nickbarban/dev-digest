import type { CSSProperties } from "react";

/** Co-located styles for FindingsHoverBadges (badge cluster + hover popover). */
export const s = {
  wrap: { position: "relative", display: "inline-flex" } satisfies CSSProperties,
  badges: { display: "flex", alignItems: "center", gap: 6 } satisfies CSSProperties,
  panel: {
    position: "absolute",
    top: "calc(100% + 8px)",
    // Anchored to the right (not left) edge of the trigger: both call sites
    // (PR list "findings" column, Timeline row) have their wide content — the
    // `1fr` title column / flex-1 text — to the left, so the panel expands
    // into that space instead of clipping at the viewport's right edge.
    right: 0,
    width: 380,
    maxWidth: "calc(100vw - 32px)",
    maxHeight: 360,
    overflowY: "auto",
    background: "var(--bg-elevated)",
    border: "1px solid var(--border-strong)",
    borderRadius: 9,
    boxShadow: "var(--shadow-modal)",
    padding: 10,
    zIndex: 50,
    animation: "ddpop .12s ease",
  } satisfies CSSProperties,
  panelTitle: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
    padding: "2px 4px 8px",
  } satisfies CSSProperties,
  loading: {
    fontSize: 13,
    color: "var(--text-muted)",
    padding: "4px 4px 6px",
  } satisfies CSSProperties,
  findingRow: {
    padding: "8px 4px",
    borderTop: "1px solid var(--border)",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  } satisfies CSSProperties,
  findingTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  } satisfies CSSProperties,
  findingTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  metaRow: { display: "flex", alignItems: "center", gap: 10 } satisfies CSSProperties,
  rationale: {
    fontSize: 12.5,
    color: "var(--text-secondary)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  } satisfies CSSProperties,
} as const;
