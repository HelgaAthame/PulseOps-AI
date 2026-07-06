import { and, count, desc, eq, ilike, or, sql, type SQL } from "drizzle-orm";

import { db } from "@/shared/api/db";

import { events } from "./event.table";
import { type EventIngestInput } from "./event.schema";

export type EventRow = typeof events.$inferSelect;

/** WHERE для событий владельца с опциональным поиском по типу/клиенту. */
function ownerWhere(ownerId: string, q?: string): SQL | undefined {
  const base = eq(events.ownerId, ownerId);
  const term = q?.trim();
  if (!term) return base;
  const like = `%${term}%`;
  return and(
    base,
    or(
      ilike(sql`${events.type}::text`, like),
      ilike(sql`${events.customerId}::text`, like)
    )
  );
}

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

/** Всего событий владельца (с учётом поиска) — для пагинации. */
export async function countOwnerEvents(
  ownerId: string,
  q?: string
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(events)
    .where(ownerWhere(ownerId, q));
  return row?.value ?? 0;
}

/** Страница событий владельца (свежие сверху, с учётом поиска). */
export async function listEventsPage(
  ownerId: string,
  { limit, offset, q }: { limit: number; offset: number; q?: string }
) {
  return db
    .select()
    .from(events)
    .where(ownerWhere(ownerId, q))
    .orderBy(desc(events.createdAt))
    .limit(limit)
    .offset(offset);
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
