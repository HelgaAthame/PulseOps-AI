import { describe, expect, it } from "vitest";

import { type EventRow, type EventType } from "@/entities/event";

import { computeMrrMovement } from "./mrr-movement";

let seq = 0;
function ev(
  type: EventType,
  atMs: number,
  opts: Partial<Pick<EventRow, "customerId" | "payload">> = {}
): EventRow {
  return {
    id: `id-${seq++}`,
    ownerId: "owner-1",
    customerId: opts.customerId ?? "cust",
    type,
    payload: opts.payload ?? null,
    createdAt: new Date(atMs),
  };
}

const START = 1000;
const END = 2000;

describe("computeMrrMovement", () => {
  it("returns zeros for no events", () => {
    expect(computeMrrMovement([], START, END)).toEqual({
      startingMrr: 0,
      new: 0,
      expansion: 0,
      reactivation: 0,
      contraction: 0,
      churned: 0,
      net: 0,
      endingMrr: 0,
    });
  });

  it("decomposes a full period into every movement bucket", () => {
    seq = 0;
    const events: EventRow[] = [
      // A: подписка 50 ДО периода → в startingMrr; апгрейд 50→80 в периоде (expansion +30)
      ev("subscription_created", 500, { customerId: "A", payload: { mrr: 50 } }),
      ev("subscription_created", 1500, { customerId: "A", payload: { mrr: 80 } }),

      // B: новая подписка 20 (new), затем отток (churned 20)
      ev("subscription_created", 1200, { customerId: "B", payload: { mrr: 20 } }),
      ev("churn_detected", 1600, { customerId: "B" }),

      // C: подписка+отток ДО периода (mrr 0, но everActive), затем 40 в периоде (reactivation +40)
      ev("subscription_created", 400, { customerId: "C", payload: { mrr: 100 } }),
      ev("churn_detected", 600, { customerId: "C" }),
      ev("subscription_created", 1300, { customerId: "C", payload: { mrr: 40 } }),

      // D: новая 30 (new), затем даунгрейд 30→10 (contraction +20)
      ev("subscription_created", 1400, { customerId: "D", payload: { mrr: 30 } }),
      ev("subscription_created", 1700, { customerId: "D", payload: { mrr: 10 } }),

      // E: подписка с битым payload → num-фолбэк 0 (new += 0)
      ev("subscription_created", 1250, { customerId: "E", payload: null }),

      // F: отток без активной подписки → не считается (ветка s.mrr>0 == false)
      ev("churn_detected", 1350, { customerId: "F" }),

      // Платёж — событие другого типа, на MRR movement не влияет (fall-through)
      ev("payment_success", 1450, { customerId: "A", payload: { amount: 80 } }),

      // A переподписывается на ту же сумму 80 → delta 0, ни в одну корзину
      ev("subscription_created", 1550, { customerId: "A", payload: { mrr: 80 } }),

      // G: событие ПОСЛЕ периода → игнорируется (break)
      ev("subscription_created", 2500, { customerId: "G", payload: { mrr: 60 } }),
    ];

    const r = computeMrrMovement(events, START, END);

    expect(r.startingMrr).toBe(50); // только A на начало периода
    expect(r.new).toBe(50); // B20 + D30 + E0
    expect(r.expansion).toBe(30); // A 50→80
    expect(r.reactivation).toBe(40); // C вернулся
    expect(r.contraction).toBe(20); // D 30→10
    expect(r.churned).toBe(20); // B ушёл
    expect(r.net).toBe(80); // 50+30+40−20−20
    expect(r.endingMrr).toBe(130); // A80 + C40 + D10
    // Инвариант согласованности.
    expect(r.startingMrr + r.net).toBe(r.endingMrr);
  });

  it("reports no movement when all events precede the period", () => {
    seq = 0;
    const events = [
      ev("subscription_created", 100, { customerId: "X", payload: { mrr: 25 } }),
    ];
    const r = computeMrrMovement(events, START, END);
    expect(r.startingMrr).toBe(25);
    expect(r.endingMrr).toBe(25);
    expect(r.net).toBe(0);
    expect(r.new).toBe(0);
  });
});
