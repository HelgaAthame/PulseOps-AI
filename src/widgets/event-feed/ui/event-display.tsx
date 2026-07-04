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
    label: "Sign-up",
    icon: UserPlus,
    badge: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  },
  subscription_created: {
    label: "New subscription",
    icon: CreditCard,
    badge: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  },
  payment_success: {
    label: "Payment succeeded",
    icon: CircleDollarSign,
    badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  payment_failed: {
    label: "Payment failed",
    icon: XCircle,
    badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
  churn_detected: {
    label: "Customer churn",
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
        ? `${payload.plan} · $${payload.mrr}/mo`
        : null;
    case "payment_success":
      return payload.amount ? `$${payload.amount}` : null;
    case "payment_failed":
      return typeof payload.reason === "string" ? payload.reason : null;
    case "churn_detected":
      return typeof payload.reason === "string" ? payload.reason : null;
  }
}
