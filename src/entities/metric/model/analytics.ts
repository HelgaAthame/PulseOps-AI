import { type EventRow } from "@/entities/event";

export type AnalyticsSnapshot = {
  /** Monthly Recurring Revenue — сумма подписок активных (не ушедших) клиентов. */
  mrr: number;
  /** Annual Recurring Revenue = MRR × 12. */
  arr: number;
  /** Уникальные клиенты с событием за последние 30 дней. */
  activeUsers: number;
  /** Доля ушедших среди подписавшихся, 0..1. */
  churnRate: number;
  /** Доля подписавшихся среди зарегистрировавшихся, 0..1. */
  conversionRate: number;
  /** Всего регистраций. */
  signups: number;
  /** Суммарная выручка по успешным платежам. */
  revenue: number;
};

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

function num(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Чистая функция: считает срез метрик из списка событий одного владельца.
 * Модель упрощённая (учебная), но самосогласованная — все доли ограничены [0,1].
 */
export function computeAnalytics(events: EventRow[]): AnalyticsSnapshot {
  const now = Date.now();

  const subscriptionMrr = new Map<string, number>(); // клиент → mrr последней подписки
  const churned = new Set<string>();
  const signupCustomers = new Set<string>();
  const activeCustomers = new Set<string>();
  let revenue = 0;
  let signups = 0;

  for (const event of events) {
    const createdMs = new Date(event.createdAt).getTime();
    if (now - createdMs <= THIRTY_DAYS_MS) {
      activeCustomers.add(event.customerId);
    }

    switch (event.type) {
      case "user_signed_up":
        signups += 1;
        signupCustomers.add(event.customerId);
        break;
      case "subscription_created":
        subscriptionMrr.set(event.customerId, num(event.payload?.mrr));
        break;
      case "payment_success":
        revenue += num(event.payload?.amount);
        break;
      case "churn_detected":
        churned.add(event.customerId);
        break;
    }
  }

  const subscribers = new Set(subscriptionMrr.keys());

  let mrr = 0;
  for (const [customer, value] of subscriptionMrr) {
    if (!churned.has(customer)) mrr += value;
  }

  let churnedSubscribers = 0;
  let convertedSignups = 0;
  for (const customer of subscribers) {
    if (churned.has(customer)) churnedSubscribers += 1;
    if (signupCustomers.has(customer)) convertedSignups += 1;
  }

  const churnRate = subscribers.size ? churnedSubscribers / subscribers.size : 0;
  const conversionRate = signupCustomers.size
    ? convertedSignups / signupCustomers.size
    : 0;

  return {
    mrr,
    arr: mrr * 12,
    activeUsers: activeCustomers.size,
    churnRate,
    conversionRate,
    signups,
    revenue,
  };
}
