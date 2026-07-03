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
    type: eventTypeEnum("type").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    payload: jsonb("payload").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("events_type_idx").on(table.type),
    index("events_created_at_idx").on(table.createdAt),
  ]
);
