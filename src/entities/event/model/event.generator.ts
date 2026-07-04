import { type EventType } from "./event.types";

export type GeneratedEvent = {
  type: EventType;
  customerId: string;
  payload: Record<string, unknown>;
};

const PLANS = [
  { plan: "starter", mrr: 15 },
  { plan: "pro", mrr: 49 },
  { plan: "enterprise", mrr: 199 },
] as const;

const SIGNUP_SOURCES = ["organic", "ads", "referral", "social"] as const;
const FAIL_REASONS = ["insufficient_funds", "card_expired", "declined"] as const;
const CHURN_REASONS = [
  "too_expensive",
  "missing_features",
  "switched_competitor",
  "inactive",
] as const;

// Веса распределения типов событий: регистраций и успешных платежей много,
// отток редок — приближено к реальному SaaS.
const WEIGHTED_TYPES: EventType[] = [
  ...(Array(5).fill("user_signed_up") as EventType[]),
  ...(Array(3).fill("subscription_created") as EventType[]),
  ...(Array(6).fill("payment_success") as EventType[]),
  ...(Array(2).fill("payment_failed") as EventType[]),
  ...(Array(1).fill("churn_detected") as EventType[]),
];

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function payloadFor(type: EventType): Record<string, unknown> {
  switch (type) {
    case "user_signed_up":
      return { source: pick(SIGNUP_SOURCES) };
    case "subscription_created": {
      const p = pick(PLANS);
      return { plan: p.plan, mrr: p.mrr };
    }
    case "payment_success": {
      const p = pick(PLANS);
      return { amount: p.mrr, currency: "usd", plan: p.plan };
    }
    case "payment_failed": {
      const p = pick(PLANS);
      return { amount: p.mrr, currency: "usd", reason: pick(FAIL_REASONS) };
    }
    case "churn_detected":
      return { reason: pick(CHURN_REASONS) };
  }
}

/**
 * Генерирует пачку случайных событий. Пул клиентов меньше числа событий,
 * поэтому один клиент даёт несколько событий — как в реальном SaaS
 * (и число уникальных customerId < числа событий = «active users»).
 */
export function generateEvents(count: number): GeneratedEvent[] {
  const poolSize = Math.max(1, Math.ceil(count * 0.6));
  const customerPool = Array.from({ length: poolSize }, () =>
    crypto.randomUUID()
  );

  return Array.from({ length: count }, () => {
    const type = pick(WEIGHTED_TYPES);
    return { type, customerId: pick(customerPool), payload: payloadFor(type) };
  });
}

export type HistoricalEvent = GeneratedEvent & { createdAt: Date };

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Генерирует реалистичную историю событий за последние `days` дней с
 * нарастающим объёмом (свежих дней больше) — чтобы графики MRR/выручки
 * показывали рост. Пул клиентов расширяется со временем.
 */
export function generateHistory(days = 60): HistoricalEvent[] {
  const events: HistoricalEvent[] = [];
  const now = Date.now();
  const customers: string[] = [];

  for (let d = days - 1; d >= 0; d--) {
    const dayStart = now - d * DAY_MS;
    const progress = (days - d) / days; // 0..1, растёт к сегодня
    const count = 2 + Math.round(progress * 8) + Math.floor(Math.random() * 4);

    for (let i = 0; i < count; i++) {
      if (customers.length === 0 || Math.random() < 0.45) {
        customers.push(crypto.randomUUID());
      }
      const type = pick(WEIGHTED_TYPES);
      const createdAt = new Date(dayStart + Math.floor(Math.random() * DAY_MS));
      events.push({
        type,
        customerId: pick(customers),
        payload: payloadFor(type),
        createdAt,
      });
    }
  }

  return events;
}
