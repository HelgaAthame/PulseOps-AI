import { afterEach, describe, expect, it, vi } from "vitest";

import { formatCurrency, formatPercent, formatRelativeTime } from "./format";

describe("formatCurrency", () => {
  it("formats whole USD with thousands separator and no cents", () => {
    expect(formatCurrency(1234)).toBe("$1,234");
  });

  it("formats zero", () => {
    expect(formatCurrency(0)).toBe("$0");
  });

  it("rounds to whole dollars", () => {
    expect(formatCurrency(1234.6)).toBe("$1,235");
  });

  it("formats negative amounts", () => {
    expect(formatCurrency(-500)).toBe("-$500");
  });
});

describe("formatPercent", () => {
  it("turns a 0..1 share into a percentage with one decimal by default", () => {
    expect(formatPercent(0.123)).toBe("12.3%");
  });

  it("honours a custom number of digits", () => {
    expect(formatPercent(0.5, 0)).toBe("50%");
  });

  it("formats 1 as 100.0%", () => {
    expect(formatPercent(1)).toBe("100.0%");
  });
});

describe("formatRelativeTime", () => {
  const now = new Date("2026-07-01T12:00:00Z");

  afterEach(() => {
    vi.useRealTimers();
  });

  function freeze() {
    vi.useFakeTimers();
    vi.setSystemTime(now);
  }

  it("returns 'now' for the current instant", () => {
    freeze();
    expect(formatRelativeTime(now)).toBe("now");
  });

  it("uses seconds under 45s", () => {
    freeze();
    const d = new Date(now.getTime() - 10_000);
    expect(formatRelativeTime(d)).toBe("10 seconds ago");
  });

  it("uses minutes under an hour", () => {
    freeze();
    const d = new Date(now.getTime() - 5 * 60_000);
    expect(formatRelativeTime(d)).toBe("5 minutes ago");
  });

  it("uses hours under a day", () => {
    freeze();
    const d = new Date(now.getTime() - 2 * 60 * 60_000);
    expect(formatRelativeTime(d)).toBe("2 hours ago");
  });

  it("uses days beyond 24h", () => {
    freeze();
    const d = new Date(now.getTime() - 3 * 24 * 60 * 60_000);
    expect(formatRelativeTime(d)).toBe("3 days ago");
  });

  it("accepts an ISO string as well as a Date", () => {
    freeze();
    const iso = new Date(now.getTime() - 2 * 60 * 60_000).toISOString();
    expect(formatRelativeTime(iso)).toBe("2 hours ago");
  });
});
