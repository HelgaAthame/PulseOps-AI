export const METRIC_TYPES = [
  "mrr",
  "arr",
  "churn_rate",
  "conversion_rate",
  "active_users",
] as const;

export type MetricType = (typeof METRIC_TYPES)[number];
