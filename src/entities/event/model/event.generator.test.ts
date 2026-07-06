import { describe, expect, it } from "vitest";

import { EVENT_TYPES } from "./event.types";
import { generateEvents, generateHistory } from "./event.generator";

const DAY_MS = 24 * 60 * 60 * 1000;

function assertPayloadShape(type: string, payload: Record<string, unknown>) {
  switch (type) {
    case "user_signed_up":
      expect(typeof payload.source).toBe("string");
      break;
    case "subscription_created":
      expect(typeof payload.plan).toBe("string");
      expect(typeof payload.mrr).toBe("number");
      break;
    case "payment_success":
      expect(typeof payload.amount).toBe("number");
      expect(payload.currency).toBe("usd");
      expect(typeof payload.plan).toBe("string");
      break;
    case "payment_failed":
      expect(typeof payload.amount).toBe("number");
      expect(typeof payload.reason).toBe("string");
      break;
    case "churn_detected":
      expect(typeof payload.reason).toBe("string");
      break;
    default:
      throw new Error(`unexpected type ${type}`);
  }
}

describe("generateEvents", () => {
  it("returns an empty array for count 0", () => {
    expect(generateEvents(0)).toEqual([]);
  });

  it("generates exactly `count` events with valid types and payloads", () => {
    const events = generateEvents(600);
    expect(events).toHaveLength(600);

    const seenTypes = new Set<string>();
    for (const e of events) {
      expect(EVENT_TYPES).toContain(e.type);
      expect(typeof e.customerId).toBe("string");
      assertPayloadShape(e.type, e.payload);
      seenTypes.add(e.type);
    }

    // На 600 событиях встречаются все пять типов — это покрывает все ветки payloadFor.
    for (const t of EVENT_TYPES) expect(seenTypes.has(t)).toBe(true);
  });

  it("reuses a smaller customer pool than the event count", () => {
    const events = generateEvents(100);
    const uniqueCustomers = new Set(events.map((e) => e.customerId));
    // Пул = ceil(100 * 0.6) = 60, значит уникальных клиентов не больше 60.
    expect(uniqueCustomers.size).toBeLessThanOrEqual(60);
    expect(uniqueCustomers.size).toBeGreaterThan(0);
  });
});

describe("generateHistory", () => {
  it("defaults to 60 days of history with growing volume", () => {
    const events = generateHistory();
    expect(events.length).toBeGreaterThan(0);

    const now = Date.now();
    for (const e of events) {
      expect(EVENT_TYPES).toContain(e.type);
      expect(e.createdAt).toBeInstanceOf(Date);
      const age = now - e.createdAt.getTime();
      // День 0 = сегодня + случайный сдвиг внутри суток → до суток «в будущем».
      expect(age).toBeGreaterThanOrEqual(-DAY_MS);
      expect(age).toBeLessThanOrEqual(60 * DAY_MS);
      assertPayloadShape(e.type, e.payload);
    }
  });

  it("honours a custom day range and keeps events within it", () => {
    const events = generateHistory(3);
    expect(events.length).toBeGreaterThan(0);
    const now = Date.now();
    for (const e of events) {
      const age = now - e.createdAt.getTime();
      expect(age).toBeGreaterThanOrEqual(-DAY_MS);
      expect(age).toBeLessThanOrEqual(3 * DAY_MS);
    }
  });
});
