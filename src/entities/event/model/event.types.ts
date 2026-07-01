export const EVENT_TYPES = [
  "user_signed_up",
  "subscription_created",
  "payment_success",
  "payment_failed",
  "churn_detected",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];
