import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { type EventRow } from "@/entities/event";
import { type EventType } from "@/entities/event";

import { computeAnalytics } from "./analytics";

const NOW = new Date("2026-07-01T00:00:00Z");
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

describe("computeAnalytics", () => {
  beforeEach(() => {
    seq = 0;
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns all-zero snapshot for no events", () => {
    expect(computeAnalytics([])).toEqual({
      mrr: 0,
      arr: 0,
      activeUsers: 0,
      churnRate: 0,
      conversionRate: 0,
      signups: 0,
      revenue: 0,
    });
  });

  it("aggregates a mixed history correctly", () => {
    const recent = new Date(NOW.getTime() - DAY); // внутри 30 дней
    const old = new Date(NOW.getTime() - 40 * DAY); // старше 30 дней

    const events: EventRow[] = [
      // A: регистрация + подписка 49 + успешный платёж 49 (все свежие)
      ev("user_signed_up", { customerId: "A", createdAt: recent }),
      ev("subscription_created", { customerId: "A", payload: { mrr: 49 }, createdAt: recent }),
      ev("payment_success", { customerId: "A", payload: { amount: 49 }, createdAt: recent }),

      // B: регистрация + ДВЕ подписки (199, затем 15 — побеждает последняя) + платёж 15
      ev("user_signed_up", { customerId: "B", createdAt: recent }),
      ev("subscription_created", {
        customerId: "B",
        payload: { mrr: 199 },
        createdAt: new Date(NOW.getTime() - 3 * DAY),
      }),
      ev("subscription_created", {
        customerId: "B",
        payload: { mrr: 15 },
        createdAt: new Date(NOW.getTime() - 2 * DAY),
      }),
      ev("payment_success", { customerId: "B", payload: { amount: 15 }, createdAt: recent }),

      // C: подписка 99, затем отток → из MRR исключается, но остаётся подписчиком
      ev("subscription_created", { customerId: "C", payload: { mrr: 99 }, createdAt: recent }),
      ev("churn_detected", { customerId: "C", createdAt: recent }),

      // D: старая регистрация (>30 дней) — считается в signups, но НЕ активна
      ev("user_signed_up", { customerId: "D", createdAt: old }),

      // Платёж с битым payload → сумма 0 (проверяем num-фолбэк)
      ev("payment_success", { customerId: "A", payload: null, createdAt: recent }),
    ];

    const a = computeAnalytics(events);

    expect(a.signups).toBe(3); // A, B, D
    expect(a.mrr).toBe(64); // A49 + B15 (C ушёл)
    expect(a.arr).toBe(768); // 64 * 12
    expect(a.revenue).toBe(64); // 49 + 15 + 0
    expect(a.activeUsers).toBe(3); // A, B, C свежие; D старый
    expect(a.churnRate).toBeCloseTo(1 / 3); // 1 из 3 подписчиков (C)
    expect(a.conversionRate).toBeCloseTo(2 / 3); // A, B из {A,B,D}
  });

  it("keeps churn and conversion at 0 when there are no subscribers", () => {
    const events = [ev("user_signed_up", { customerId: "X", createdAt: NOW })];
    const a = computeAnalytics(events);
    expect(a.churnRate).toBe(0);
    expect(a.conversionRate).toBe(0);
    expect(a.mrr).toBe(0);
  });
});
