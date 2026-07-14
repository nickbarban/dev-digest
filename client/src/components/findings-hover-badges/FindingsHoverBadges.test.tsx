import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord } from "@devdigest/shared";
import messages from "../../../messages/en/prReview.json";
import { FindingsHoverBadges } from "./FindingsHoverBadges";

afterEach(cleanup);

function finding(severity: FindingRecord["severity"], id: string, title: string): FindingRecord {
  return {
    id,
    severity,
    category: "security",
    title,
    file: "src/config.ts",
    start_line: 12,
    end_line: 12,
    rationale: "A live secret is committed in source.",
    suggestion: null,
    confidence: 0.9,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
  };
}

const FINDINGS: FindingRecord[] = [
  finding("CRITICAL", "f1", "Hardcoded Stripe secret key"),
  finding("WARNING", "f2", "N+1 query"),
];

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("FindingsHoverBadges", () => {
  it("renders a muted dash when all counts are zero", () => {
    renderWithIntl(
      <FindingsHoverBadges counts={{ critical: 0, warning: 0, suggestion: 0 }} findings={[]} />,
    );
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders only non-zero severity badges", () => {
    renderWithIntl(
      <FindingsHoverBadges counts={{ critical: 1, warning: 2, suggestion: 0 }} findings={[]} />,
    );
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("shows a popover with individual findings on hover", () => {
    const { container } = renderWithIntl(
      <FindingsHoverBadges counts={{ critical: 1, warning: 1, suggestion: 0 }} findings={FINDINGS} />,
    );
    fireEvent.mouseEnter(container.firstElementChild!);
    expect(screen.getByText("2 findings")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded Stripe secret key")).toBeInTheDocument();
    expect(screen.getByText("N+1 query")).toBeInTheDocument();
  });

  it("shows a loading state instead of the finding list while loading", () => {
    const { container } = renderWithIntl(
      <FindingsHoverBadges counts={{ critical: 1, warning: 0, suggestion: 0 }} findings={undefined} loading />,
    );
    fireEvent.mouseEnter(container.firstElementChild!);
    expect(screen.getByText("Loading findings…")).toBeInTheDocument();
  });
});
