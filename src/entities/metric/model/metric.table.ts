import {
  doublePrecision,
  index,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "@/entities/user/model/user.table";

import { METRIC_TYPES } from "./metric.types";

export const metricTypeEnum = pgEnum("metric_type", METRIC_TYPES);

/** Снимок значения метрики на момент пересчёта (история, а не текущее состояние). */
export const metrics = pgTable(
  "metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: metricTypeEnum("type").notNull(),
    value: doublePrecision("value").notNull(),
    computedAt: timestamp("computed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("metrics_owner_type_computed_idx").on(
      table.ownerId,
      table.type,
      table.computedAt
    ),
  ]
);
