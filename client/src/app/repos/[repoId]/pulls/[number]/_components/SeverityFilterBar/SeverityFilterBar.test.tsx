import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import type { FindingRecord } from "@devdigest/shared";
import { SeverityFilterBar } from "./SeverityFilterBar";

afterEach(cleanup);

function finding(severity: FindingRecord["severity"], id: string): FindingRecord {
  return {
    id,
    severity,
    category: "security",
    title: "t",
    file: "f.ts",
    start_line: 1,
    end_line: 1,
    rationale: "r",
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
  finding("CRITICAL", "f1"),
  finding("CRITICAL", "f2"),
  finding("CRITICAL", "f3"),
  finding("WARNING", "f4"),
  finding("SUGGESTION", "f5"),
];

describe("SeverityFilterBar", () => {
  it("shows per-severity counts across all findings", () => {
    render(<SeverityFilterBar findings={FINDINGS} active={null} onToggle={() => {}} />);
    expect(screen.getByText("CRITICAL").closest("button")).toHaveTextContent("3");
    expect(screen.getByText("WARNING").closest("button")).toHaveTextContent("1");
    expect(screen.getByText("SUGGESTION").closest("button")).toHaveTextContent("1");
  });

  it("calls onToggle with the clicked severity", () => {
    const onToggle = vi.fn();
    render(<SeverityFilterBar findings={FINDINGS} active={null} onToggle={onToggle} />);
    fireEvent.click(screen.getByText("WARNING"));
    expect(onToggle).toHaveBeenCalledWith("WARNING");
  });

  it("renders all three severities even at zero count", () => {
    render(<SeverityFilterBar findings={[]} active={null} onToggle={() => {}} />);
    expect(screen.getByText("CRITICAL")).toBeInTheDocument();
    expect(screen.getByText("WARNING")).toBeInTheDocument();
    expect(screen.getByText("SUGGESTION")).toBeInTheDocument();
  });
});
