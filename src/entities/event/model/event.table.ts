import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { users } from "@/entities/user/model/user.table";

import { EVENT_TYPES } from "./event.types";

export const eventTypeEnum = pgEnum("event_type", EVENT_TYPES);

export const events = pgTable(
  "events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Аккаунт-владелец симулируемого воркспейса (изоляция данных между
    // залогиненными пользователями).
    ownerId: uuid("owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Синтетический клиент симулируемого SaaS — НЕ аккаунт приложения,
    // поэтому без FK. Уникальные customerId = "active users" в аналитике.
    customerId: uuid("customer_id").notNull(),
    type: eventTypeEnum("type").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("events_owner_created_idx").on(table.ownerId, table.createdAt),
    index("events_type_idx").on(table.type),
  ]
);
