import {
  CircleDollarSign,
  CreditCard,
  UserMinus,
  UserPlus,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { type EventType } from "@/entities/event";

type EventDisplay = {
  label: string;
  icon: LucideIcon;
  /** Классы для цветной «плашки» иконки (light + dark). */
  badge: string;
};

export const eventDisplay: Record<EventType, EventDisplay> = {
  user_signed_up: {
    label: "Регистрация",
    icon: UserPlus,
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  subscription_created: {
    label: "Новая подписка",
    icon: CreditCard,
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  payment_success: {
    label: "Успешный платёж",
    icon: CircleDollarSign,
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  payment_failed: {
    label: "Ошибка платежа",
    icon: XCircle,
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  churn_detected: {
    label: "Отток клиента",
    icon: UserMinus,
    badge: "bg-red-500/10 text-red-600 dark:text-red-400",
  },
};

/** Короткая сводка payload для строки ленты. */
export function summarizePayload(
  type: EventType,
  payload: Record<string, unknown> | null
): string | null {
  if (!payload) return null;

  switch (type) {
    case "user_signed_up":
      return typeof payload.source === "string" ? payload.source : null;
    case "subscription_created":
      return payload.plan && payload.mrr
        ? `${payload.plan} · $${payload.mrr}/мес`
        : null;
    case "payment_success":
      return payload.amount ? `$${payload.amount}` : null;
    case "payment_failed":
      return typeof payload.reason === "string" ? payload.reason : null;
    case "churn_detected":
      return typeof payload.reason === "string" ? payload.reason : null;
  }
}
