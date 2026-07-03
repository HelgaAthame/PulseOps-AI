import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * id совпадает с auth.users.id из Supabase Auth — это отдельная
 * "теневая" таблица в public-схеме, auth.users нами не управляется.
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
