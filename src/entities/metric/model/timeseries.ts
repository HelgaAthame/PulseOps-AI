import { type EventRow, type EventType } from "@/entities/event";

const DAY_MS = 24 * 60 * 60 * 1000;

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const labelFmt = new Intl.DateTimeFormat("en", {
  month: "short",
  day: "numeric",
});

export type DailyPoint = {
  /** ISO-дата начала дня. */
  date: string;
  /** Короткая метка для оси, напр. «Jul 4». */
  label: string;
  /** Выручка за день (успешные платежи). */
  revenue: number;
  /** Регистраций за день. */
  signups: number;
  /** MRR на конец дня (накопительно). */
  mrr: number;
};

function dayStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Дневные ряды за последние `days` дней: выручка, регистрации, MRR. */
export function computeDailySeries(
  events: EventRow[],
  days = 60
): DailyPoint[] {
  const today = dayStart(Date.now());
  const dayKeys: number[] = [];
  for (let i = days - 1; i >= 0; i--) dayKeys.push(today - i * DAY_MS);

  const revByDay = new Map<number, number>();
  const signupsByDay = new Map<number, number>();
  for (const e of events) {
    const key = dayStart(new Date(e.createdAt).getTime());
    if (e.type === "payment_success") {
      revByDay.set(key, (revByDay.get(key) ?? 0) + num(e.payload?.amount));
    } else if (e.type === "user_signed_up") {
      signupsByDay.set(key, (signupsByDay.get(key) ?? 0) + 1);
    }
  }

  // MRR на конец каждого дня: идём по событиям по возрастанию времени.
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
  const subMrr = new Map<string, number>();
  const churned = new Set<string>();
  let ei = 0;

  return dayKeys.map((ds) => {
    const endOfDay = ds + DAY_MS;
    while (
      ei < sorted.length &&
      new Date(sorted[ei].createdAt).getTime() < endOfDay
    ) {
      const e = sorted[ei];
      if (e.type === "subscription_created") {
        subMrr.set(e.customerId, num(e.payload?.mrr));
      } else if (e.type === "churn_detected") {
        churned.add(e.customerId);
      }
      ei++;
    }
    let mrr = 0;
    for (const [customer, value] of subMrr) {
      if (!churned.has(customer)) mrr += value;
    }
    return {
      date: new Date(ds).toISOString(),
      label: labelFmt.format(ds),
      revenue: revByDay.get(ds) ?? 0,
      signups: signupsByDay.get(ds) ?? 0,
      mrr,
    };
  });
}

export type EventTypeCount = { type: EventType; count: number };

/** Количество событий по типам (для разбивки). */
export function computeEventTypeCounts(events: EventRow[]): EventTypeCount[] {
  const counts = new Map<EventType, number>();
  for (const e of events) {
    counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
  }
  return [...counts.entries()].map(([type, count]) => ({ type, count }));
}
