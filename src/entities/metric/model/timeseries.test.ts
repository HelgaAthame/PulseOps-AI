import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type EventRow, type EventType } from "@/entities/event";

import { computeDailySeries, computeEventTypeCounts } from "./timeseries";

const NOW = new Date("2026-07-15T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

let seq = 0;
function ev(
  type: EventType,
  opts: Partial<Pick<EventRow, "customerId" | "payload" | "createdAt">> = {}
): EventRow {
  return {
    id: `id-${seq++}`,
    ownerId: "owner-1",
    customerId: opts.customerId ?? "cust",
    type,
    payload: opts.payload ?? null,
    createdAt: opts.createdAt ?? NOW,
  };
}

describe("computeDailySeries", () => {
  beforeEach(() => {
    seq = 0;
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 60 points by default", () => {
    expect(computeDailySeries([])).toHaveLength(60);
  });

  it("returns the requested number of ascending daily points", () => {
    const series = computeDailySeries([], 5);
    expect(series).toHaveLength(5);
    for (let i = 1; i < series.length; i++) {
      expect(new Date(series[i].date).getTime()).toBeGreaterThan(
        new Date(series[i - 1].date).getTime()
      );
      expect(series[i].label).toBeTypeOf("string");
      expect(series[i].label.length).toBeGreaterThan(0);
    }
  });

  it("aggregates revenue, signups and end-of-day MRR (churn removes MRR)", () => {
    const day = (back: number, hour = 12) =>
      new Date(NOW.getTime() - back * DAY - (12 - hour) * 60 * 60 * 1000);

    const events: EventRow[] = [
      // За 2 дня до сегодня: подписка X на 30 → держит MRR до оттока
      ev("subscription_created", { customerId: "X", payload: { mrr: 30 }, createdAt: day(2) }),
      // Вчера: платёж 40
      ev("payment_success", { customerId: "X", payload: { amount: 40 }, createdAt: day(1) }),
      // Сегодня: отток X (MRR 30 уходит), подписка A на 50, платёж 100, 2 регистрации
      ev("churn_detected", { customerId: "X", createdAt: day(0) }),
      ev("subscription_created", { customerId: "A", payload: { mrr: 50 }, createdAt: day(0) }),
      ev("payment_success", { customerId: "A", payload: { amount: 100 }, createdAt: day(0) }),
      ev("user_signed_up", { customerId: "A", createdAt: day(0) }),
      ev("user_signed_up", { customerId: "B", createdAt: day(0) }),
      // Платёж с битым payload → 0 (num-фолбэк)
      ev("payment_success", { customerId: "A", payload: null, createdAt: day(0) }),
    ];

    const series = computeDailySeries(events, 5);
    const totalRevenue = series.reduce((s, p) => s + p.revenue, 0);
    const totalSignups = series.reduce((s, p) => s + p.signups, 0);

    expect(totalRevenue).toBe(140); // 40 + 100 + 0
    expect(totalSignups).toBe(2);
    expect(series.some((p) => p.mrr === 30)).toBe(true); // до оттока держится 30
    expect(series[series.length - 1].mrr).toBe(50); // после оттока X: только A
    // День без выручки/регистраций → нули (ветка `?? 0`)
    expect(series[0].revenue).toBe(0);
    expect(series[0].signups).toBe(0);
    expect(series[0].mrr).toBe(0);
  });
});

describe("computeEventTypeCounts", () => {
  it("counts events per type", () => {
    seq = 0;
    const events = [
      ev("payment_success"),
      ev("payment_success"),
      ev("user_signed_up"),
      ev("churn_detected"),
    ];
    const counts = computeEventTypeCounts(events);
    const byType = Object.fromEntries(counts.map((c) => [c.type, c.count]));

    expect(byType.payment_success).toBe(2);
    expect(byType.user_signed_up).toBe(1);
    expect(byType.churn_detected).toBe(1);
    expect(counts).toHaveLength(3);
  });

  it("returns an empty array for no events", () => {
    expect(computeEventTypeCounts([])).toEqual([]);
  });
});
