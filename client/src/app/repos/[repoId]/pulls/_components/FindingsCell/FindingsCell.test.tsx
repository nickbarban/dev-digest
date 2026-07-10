import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord, PrMeta, ReviewRecord } from "@devdigest/shared";
import messages from "../../../../../../../messages/en/prReview.json";
import { FindingsCell } from "./FindingsCell";

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

const REVIEWS: ReviewRecord[] = [
  {
    id: "r1",
    pr_id: "pr1",
    agent_id: "a1",
    run_id: "run1",
    agent_name: "Security Reviewer",
    kind: "review",
    verdict: "request_changes",
    summary: null,
    score: 38,
    model: null,
    grounding: null,
    created_at: new Date().toISOString(),
    findings: [finding("CRITICAL", "f1", "Hardcoded Stripe secret key"), finding("WARNING", "f2", "N+1 query")],
  },
];

const usePrReviewsMock = vi.fn();
vi.mock("@/lib/hooks/reviews", () => ({
  usePrReviews: (...args: unknown[]) => usePrReviewsMock(...args),
}));
vi.mock("@/lib/repo-context", () => ({
  useActiveRepo: () => ({ activeRepo: { full_name: "acme/payments-api" } }),
}));

function pr(overrides: Partial<PrMeta> = {}): PrMeta {
  return {
    id: "pr1",
    number: 482,
    title: "Add rate limiting",
    author: "marisa.koch",
    branch: "feat/rate-limit",
    base: "main",
    head_sha: "abc123",
    additions: 10,
    deletions: 2,
    files_count: 1,
    status: "reviewed",
    opened_at: null,
    updated_at: null,
    score: 61,
    cost_usd: 0.01,
    findings_critical: 0,
    findings_warning: 0,
    findings_suggestion: 0,
    ...overrides,
  };
}

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("FindingsCell", () => {
  it("renders a muted dash when there are no findings", () => {
    usePrReviewsMock.mockReturnValue({ data: undefined, isLoading: false });
    renderWithIntl(<FindingsCell pr={pr()} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders only non-zero severity badges", () => {
    usePrReviewsMock.mockReturnValue({ data: undefined, isLoading: false });
    renderWithIntl(<FindingsCell pr={pr({ findings_critical: 1, findings_warning: 2, findings_suggestion: 0 })} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("lazily fetches and shows individual findings on hover (delegates rendering to FindingsHoverBadges)", () => {
    usePrReviewsMock.mockReturnValue({ data: REVIEWS, isLoading: false });
    const { container } = renderWithIntl(
      <FindingsCell pr={pr({ findings_critical: 1, findings_warning: 1 })} />,
    );
    fireEvent.mouseEnter(container.firstElementChild!);
    expect(screen.getByText("2 findings")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded Stripe secret key")).toBeInTheDocument();
    expect(screen.getByText("N+1 query")).toBeInTheDocument();
  });
});
