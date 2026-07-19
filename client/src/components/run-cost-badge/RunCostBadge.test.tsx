import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { formatCost, RunCostBadge } from "./RunCostBadge";

afterEach(cleanup);

describe("formatCost", () => {
  it("returns '—' for null", () => {
    expect(formatCost(null)).toBe("—");
  });

  it("returns '—' for undefined", () => {
    expect(formatCost(undefined)).toBe("—");
  });

  it("formats a typical 3-decimal cost without trailing zeros", () => {
    expect(formatCost(0.014)).toBe("$0.014");
  });

  it("strips trailing zeros: 0.060 → $0.06", () => {
    expect(formatCost(0.06)).toBe("$0.06");
  });

  it("strips trailing zeros: 0.100 → $0.1", () => {
    expect(formatCost(0.1)).toBe("$0.1");
  });

  it("formats a larger cost correctly", () => {
    expect(formatCost(0.041)).toBe("$0.041");
  });
});

describe("RunCostBadge", () => {
  it("renders '—' when value is null", () => {
    render(<RunCostBadge value={null} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders '—' when value is undefined", () => {
    render(<RunCostBadge value={undefined} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("renders formatted cost when value is provided", () => {
    render(<RunCostBadge value={0.014} />);
    expect(screen.getByText("$0.014")).toBeInTheDocument();
  });
});
