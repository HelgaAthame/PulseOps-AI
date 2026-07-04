import { desc, eq } from "drizzle-orm";

import { db } from "@/shared/api/db";

import { events } from "./event.table";
import { type EventIngestInput } from "./event.schema";

export type EventRow = typeof events.$inferSelect;

type SeedRow = {
  type: EventRow["type"];
  customerId: string;
  payload: Record<string, unknown> | null;
  createdAt: Date;
};

/** Заменяет всю историю событий владельца (для сида демо-данных). */
export async function replaceOwnerEvents(ownerId: string, rows: SeedRow[]) {
  await db.delete(events).where(eq(events.ownerId, ownerId));
  if (rows.length > 0) {
    await db.insert(events).values(rows.map((row) => ({ ownerId, ...row })));
  }
  return rows.length;
}

export async function insertEvent(ownerId: string, input: EventIngestInput) {
  const [row] = await db
    .insert(events)
    .values({ ownerId, ...input })
    .returning();
  return row;
}

export async function insertEvents(
  ownerId: string,
  inputs: EventIngestInput[]
) {
  if (inputs.length === 0) return [];
  return db
    .insert(events)
    .values(inputs.map((input) => ({ ownerId, ...input })))
    .returning();
}

export async function listRecentEvents(ownerId: string, limit = 20) {
  return db
    .select()
    .from(events)
    .where(eq(events.ownerId, ownerId))
    .orderBy(desc(events.createdAt))
    .limit(limit);
}

/**
 * Все события владельца для расчёта аналитики. Лимит-предохранитель на 5000 —
 * для учебной симуляции достаточно; на проде агрегаты считались бы в SQL.
 */
export async function listAllEvents(ownerId: string, limit = 5000) {
  return db
    .select()
    .from(events)
    .where(eq(events.ownerId, ownerId))
    .orderBy(desc(events.createdAt))
    .limit(limit);
}
