import {
  doublePrecision,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { METRIC_TYPES } from "./metric.types";

export const metricTypeEnum = pgEnum("metric_type", METRIC_TYPES);

/** Снимок значения метрики на момент пересчёта (не текущее состояние, а история). */
export const metrics = pgTable(
  "metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    type: metricTypeEnum("type").notNull(),
    value: doublePrecision("value").notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("metrics_type_idx").on(table.type),
    index("metrics_computed_at_idx").on(table.computedAt),
  ]
);
